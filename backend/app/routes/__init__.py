from .auth import router as auth_router
from .debates import router as debates_router
from .resources import router as resources_router
from .notifications import router as notifications_router

__all__ = ["auth_router", "debates_router", "resources_router", "notifications_router"]
