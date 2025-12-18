"""
Centralized logging service for the application.
Provides structured logging with context and different log levels.
"""
import logging
import json
from datetime import datetime
from typing import Any, Dict, Optional
import sys


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output"""

    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
    }
    RESET = '\033[0m'

    def format(self, record):
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{self.RESET}"
        return super().format(record)


class StructuredLogger:
    """Structured logger with context support"""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)

        # Console handler with colors
        if not self.logger.handlers:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setLevel(logging.DEBUG)
            formatter = ColoredFormatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

    def _format_message(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Format message with optional context"""
        if context:
            context_str = json.dumps(context, default=str)
            return f"{message} | Context: {context_str}"
        return message

    def debug(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log debug message"""
        self.logger.debug(self._format_message(message, context))

    def info(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log info message"""
        self.logger.info(self._format_message(message, context))

    def warning(self, message: str, context: Optional[Dict[str, Any]] = None):
        """Log warning message"""
        self.logger.warning(self._format_message(message, context))

    def error(self, message: str, context: Optional[Dict[str, Any]] = None, exc_info: bool = False):
        """Log error message"""
        self.logger.error(self._format_message(message, context), exc_info=exc_info)

    def critical(self, message: str, context: Optional[Dict[str, Any]] = None, exc_info: bool = False):
        """Log critical message"""
        self.logger.critical(self._format_message(message, context), exc_info=exc_info)


# Pre-configured loggers for different parts of the application
api_logger = StructuredLogger('api')
db_logger = StructuredLogger('database')
auth_logger = StructuredLogger('auth')
service_logger = StructuredLogger('service')
websocket_logger = StructuredLogger('websocket')
