from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import ReferralResponse, ReferralApply, CoinBalanceResponse
from app.utils.logger import api_logger
from sqlalchemy import text
import random
import string

router = APIRouter(prefix="/referrals", tags=["referrals"])


def generate_referral_code() -> str:
    """Generate a unique 8-character referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.get("/my-code", response_model=ReferralResponse)
async def get_my_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        check_query = text("""
            SELECT referral_code, total_referrals, total_coins_earned
            FROM user_referrals
            WHERE user_id = :user_id
        """)

        result = db.execute(check_query, {"user_id": current_user.id})
        existing = result.fetchone()

        if existing:
            return {
                "referral_code": existing.referral_code,
                "total_referrals": existing.total_referrals,
                "total_coins_earned": existing.total_coins_earned
            }

        referral_code = generate_referral_code()

        while True:
            check_unique = text("""
                SELECT COUNT(*) as count
                FROM user_referrals
                WHERE referral_code = :code
            """)

            count_result = db.execute(check_unique, {"code": referral_code}).fetchone()

            if count_result.count == 0:
                break

            referral_code = generate_referral_code()

        insert_query = text("""
            INSERT INTO user_referrals (user_id, referral_code)
            VALUES (:user_id, :referral_code)
        """)

        db.execute(insert_query, {
            "user_id": current_user.id,
            "referral_code": referral_code
        })

        db.commit()

        api_logger.info(f"Generated referral code {referral_code} for user {current_user.id}")

        return {
            "referral_code": referral_code,
            "total_referrals": 0,
            "total_coins_earned": 0
        }

    except Exception as e:
        db.rollback()
        api_logger.error(f"Error getting referral code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get referral code"
        )


@router.post("/apply", status_code=status.HTTP_200_OK)
async def apply_referral_code(
    referral_data: ReferralApply,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        check_already_used = text("""
            SELECT COUNT(*) as count
            FROM referral_history
            WHERE referred_user_id = :user_id
        """)

        used_result = db.execute(check_already_used, {"user_id": current_user.id}).fetchone()

        if used_result.count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already used a referral code"
            )

        find_referrer = text("""
            SELECT user_id
            FROM user_referrals
            WHERE referral_code = :code
        """)

        referrer_result = db.execute(find_referrer, {"code": referral_data.referral_code}).fetchone()

        if not referrer_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid referral code"
            )

        referrer_id = referrer_result.user_id

        if referrer_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot use your own referral code"
            )

        record_referral = text("""
            INSERT INTO referral_history (
                referrer_id, referred_user_id, coins_awarded
            ) VALUES (
                :referrer_id, :referred_user_id, 2500
            )
        """)

        db.execute(record_referral, {
            "referrer_id": referrer_id,
            "referred_user_id": current_user.id
        })

        update_referrer_stats = text("""
            UPDATE user_referrals
            SET total_referrals = total_referrals + 1,
                total_coins_earned = total_coins_earned + 2500
            WHERE user_id = :referrer_id
        """)

        db.execute(update_referrer_stats, {"referrer_id": referrer_id})

        update_referrer_coins = text("""
            UPDATE users
            SET coins = coins + 2500
            WHERE id = :referrer_id
        """)

        db.execute(update_referrer_coins, {"referrer_id": referrer_id})

        db.commit()

        api_logger.info(f"User {current_user.id} applied referral code from user {referrer_id}")

        return {
            "message": "Referral code applied successfully!",
            "coins_awarded_to_referrer": 2500
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        api_logger.error(f"Error applying referral code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to apply referral code"
        )


@router.get("/my-referrals")
async def get_my_referrals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT rh.referred_user_id, rh.coins_awarded, rh.created_at,
                   u.username, u.email
            FROM referral_history rh
            JOIN users u ON rh.referred_user_id = u.id
            WHERE rh.referrer_id = :user_id
            ORDER BY rh.created_at DESC
        """)

        result = db.execute(query, {"user_id": current_user.id})
        referrals = result.fetchall()

        return [
            {
                "referred_user_id": row.referred_user_id,
                "username": row.username,
                "email": row.email,
                "coins_awarded": row.coins_awarded,
                "created_at": row.created_at
            }
            for row in referrals
        ]

    except Exception as e:
        api_logger.error(f"Error fetching referrals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch referrals"
        )


@router.get("/coins", response_model=CoinBalanceResponse)
async def get_coin_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT coins
            FROM users
            WHERE id = :user_id
        """)

        result = db.execute(query, {"user_id": current_user.id})
        row = result.fetchone()

        return {
            "coins": row.coins if row else 0
        }

    except Exception as e:
        api_logger.error(f"Error fetching coin balance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch coin balance"
        )
