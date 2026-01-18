import socketio
from aiohttp import web
import asyncio
from typing import Dict, Set
import uuid

sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

app = web.Application()
sio.attach(app)

waiting_users: Dict[str, Dict] = {}
rooms: Dict[str, Set[str]] = {}
user_rooms: Dict[str, str] = {}
user_info: Dict[str, Dict] = {}
pending_acceptances: Dict[str, Set[str]] = {}  # room_id -> set of sids who accepted


@sio.event
async def connect(sid, environ):
    print(f'Client connected: {sid}')
    await sio.emit('connected', {'sid': sid}, room=sid)


@sio.event
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

    if sid in waiting_users:
        del waiting_users[sid]

    if sid in user_rooms:
        room_id = user_rooms[sid]
        if room_id in rooms:
            rooms[room_id].discard(sid)

            for other_user in rooms[room_id]:
                await sio.emit('peer-disconnected', {'userId': sid}, room=other_user)

            if len(rooms[room_id]) == 0:
                del rooms[room_id]

        del user_rooms[sid]
    
    # Clean up pending acceptances
    for room_id, accepted_sids in list(pending_acceptances.items()):
        if sid in accepted_sids:
            accepted_sids.discard(sid)
            if len(accepted_sids) == 0:
                del pending_acceptances[room_id]

    if sid in user_info:
        del user_info[sid]


@sio.event
async def find_match(sid, data):
    """Find a debate partner"""
    topic = data.get('topic', 'general')
    user_email = data.get('email', 'Anonymous')

    print(f'User {sid} ({user_email}) looking for match on topic: {topic}')

    user_info[sid] = {'email': user_email, 'topic': topic}

    matched = False
    for waiting_sid, waiting_data in list(waiting_users.items()):
        if waiting_data['topic'] == topic and waiting_sid != sid:
            partner_sid = waiting_sid
            del waiting_users[partner_sid]

            partner_email = user_info.get(partner_sid, {}).get('email', 'Anonymous')

            await sio.emit('match-request', {
                'partnerId': sid,
                'partnerEmail': user_email,
                'topic': topic
            }, room=partner_sid)

            await sio.emit('match-request', {
                'partnerId': partner_sid,
                'partnerEmail': partner_email,
                'topic': topic
            }, room=sid)

            print(f'Match request sent: {sid} ({user_email}) <-> {partner_sid} ({partner_email}) on topic: {topic}')
            matched = True
            break

    if not matched:
        waiting_users[sid] = {'topic': topic, 'email': user_email}
        await sio.emit('waiting', {'message': f'Looking for a debate partner on {topic}...'}, room=sid)
        print(f'User {sid} ({user_email}) added to waiting list for topic: {topic}')


@sio.event
async def accept_match(sid, data):
    """Accept a match with a partner"""
    partner_sid = data.get('partnerId')

    if not partner_sid:
        return

    # Check if partner has already accepted (they would have created a room)
    # Look for a room where partner_sid is waiting
    room_id = None
    initiator_sid = None
    
    # Check if partner already accepted and is waiting
    if partner_sid in user_rooms:
        room_id = user_rooms[partner_sid]
        if room_id in pending_acceptances:
            # Partner is waiting, this is the second acceptance
            pending_acceptances[room_id].add(sid)
            initiator_sid = list(pending_acceptances[room_id])[0]
    else:
        # This is the first acceptance, create new room
        room_id = str(uuid.uuid4())
        rooms[room_id] = {sid, partner_sid}
        pending_acceptances[room_id] = {sid}
        user_rooms[sid] = room_id
        await sio.enter_room(sid, room_id)
    
    # Check if both users have accepted
    if room_id in pending_acceptances and len(pending_acceptances[room_id]) == 2:
        # Both users accepted, emit match-found to both
        if partner_sid not in user_rooms:
            user_rooms[partner_sid] = room_id
            await sio.enter_room(partner_sid, room_id)
        
        if sid not in user_rooms:
            user_rooms[sid] = room_id
            await sio.enter_room(sid, room_id)
        
        # Determine initiator (first to accept)
        if not initiator_sid:
            initiator_sid = list(pending_acceptances[room_id])[0]
        
        await sio.emit('match-found', {
            'roomId': room_id,
            'partnerId': partner_sid,
            'initiator': (sid == initiator_sid)
        }, room=sid)

        await sio.emit('match-found', {
            'roomId': room_id,
            'partnerId': sid,
            'initiator': (partner_sid == initiator_sid)
        }, room=partner_sid)

        print(f'Match accepted by both: {sid} <-> {partner_sid} in room {room_id}')
        # Clean up pending acceptances
        del pending_acceptances[room_id]
    else:
        # Only one user accepted so far, notify them they're waiting
        await sio.emit('match-accepted-waiting', {
            'message': 'Waiting for partner to accept...'
        }, room=sid)
        print(f'Match partially accepted: {sid} accepted, waiting for {partner_sid}')


@sio.event
async def reject_match(sid, data):
    """Reject a match with a partner"""
    partner_sid = data.get('partnerId')

    await sio.emit('match-rejected', {}, room=partner_sid)
    await sio.emit('match-rejected', {}, room=sid)

    print(f'Match rejected: {sid} rejected {partner_sid}')

    if sid in user_info:
        topic = user_info[sid]['topic']
        email = user_info[sid]['email']
        waiting_users[sid] = {'topic': topic, 'email': email}


@sio.event
async def cancel_search(sid, data):
    """Cancel the search for a partner"""
    if sid in waiting_users:
        del waiting_users[sid]
        await sio.emit('search-cancelled', {}, room=sid)
        print(f'User {sid} cancelled search')


@sio.event
async def signal(sid, data):
    """Forward WebRTC signaling data between peers"""
    target = data.get('target')
    signal_data = data.get('signal')

    if target:
        await sio.emit('signal', {
            'signal': signal_data,
            'sender': sid
        }, room=target)


@sio.event
async def offer(sid, data):
    """Forward WebRTC offer"""
    target = data.get('target')
    offer_data = data.get('offer')

    if target:
        await sio.emit('offer', {
            'offer': offer_data,
            'sender': sid
        }, room=target)


@sio.event
async def answer(sid, data):
    """Forward WebRTC answer"""
    target = data.get('target')
    answer_data = data.get('answer')

    if target:
        await sio.emit('answer', {
            'answer': answer_data,
            'sender': sid
        }, room=target)


@sio.event
async def ice_candidate(sid, data):
    """Forward ICE candidate"""
    target = data.get('target')
    candidate = data.get('candidate')

    if target:
        await sio.emit('ice_candidate', {
            'candidate': candidate,
            'sender': sid
        }, room=target)


@sio.event
async def leave_room(sid, data):
    """Leave the current debate room"""
    if sid in user_rooms:
        room_id = user_rooms[sid]

        if room_id in rooms:
            rooms[room_id].discard(sid)

            for other_user in rooms[room_id]:
                await sio.emit('peer-left', {'userId': sid}, room=other_user)

            if len(rooms[room_id]) == 0:
                del rooms[room_id]

        await sio.leave_room(sid, room_id)
        del user_rooms[sid]

        await sio.emit('left-room', {}, room=sid)


async def index(request):
    return web.Response(text='WebSocket Signaling Server Running', content_type='text/html')


app.router.add_get('/', index)


if __name__ == '__main__':
    print('Starting WebSocket Server on port 8001...')
    print('Waiting for connections...')
    web.run_app(app, host='0.0.0.0', port=8001)
