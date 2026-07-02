import logging
import sys
from pathlib import Path

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent

# Create logger instance
logger = logging.getLogger("todo_app")
logger.setLevel(logging.INFO)

# Prevent log duplication if imported multiple times
if not logger.handlers:
    # Formatter for log messages
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # File handler (logs both INFO and ERROR to app.log)
    file_handler = logging.FileHandler(BASE_DIR / "app.log", encoding="utf-8")
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    # Console handler (logs to stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # Add both handlers to the logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
