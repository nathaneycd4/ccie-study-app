"""SM-2 Spaced Repetition Algorithm."""
from datetime import date, timedelta
from typing import Tuple


def calculate_next_review(
    ease_factor: float,
    interval: int,
    repetitions: int,
    quality: int,  # 5=correct, 3=almost, 1=missed
) -> Tuple[float, int, int, date]:
    """
    SM-2 algorithm.

    Args:
        ease_factor: Current ease factor (min 1.3, typically 2.5)
        interval: Current interval in days
        repetitions: Number of successful repetitions
        quality: Response quality (5=correct, 3=almost, 1=missed)

    Returns:
        (new_ease_factor, new_interval, new_repetitions, next_review_date)
    """
    if quality < 3:
        # Incorrect response — reset repetitions and interval
        new_repetitions = 0
        new_interval = 1
    else:
        # Correct response
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)
        new_repetitions = repetitions + 1

    # Update ease factor
    new_ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease_factor = max(1.3, new_ease_factor)

    next_review = date.today() + timedelta(days=new_interval)

    return new_ease_factor, new_interval, new_repetitions, next_review


def quality_label(quality: int) -> str:
    if quality >= 5:
        return "correct"
    elif quality >= 3:
        return "almost"
    else:
        return "missed"
