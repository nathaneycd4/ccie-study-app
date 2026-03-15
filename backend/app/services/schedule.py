"""Study schedule and progress tracking."""
from datetime import date, timedelta
from typing import Optional, List
from app.schemas.schemas import ModuleInfo, ProgressResponse, StudySessionOut

PROGRAMME_START = date(2026, 2, 17)
PROGRAMME_END = date(2027, 1, 30)

# (start_date, end_date, module_name)
SCHEDULE = [
    (date(2026, 2, 17), date(2026, 2, 23), "Induction/Admin"),
    (date(2026, 2, 24), date(2026, 3, 27), "ENARSI"),
    (date(2026, 3, 30), date(2026, 3, 31), "RECAP"),
    (date(2026, 4, 1),  date(2026, 4, 28), "BGP"),
    (date(2026, 4, 29), date(2026, 4, 30), "RECAP"),
    (date(2026, 5, 1),  date(2026, 5, 22), "MPLS"),
    (date(2026, 5, 25), date(2026, 5, 26), "RECAP"),
    (date(2026, 5, 27), date(2026, 6, 12), "MCAST"),
    (date(2026, 6, 15), date(2026, 6, 16), "RECAP"),
    (date(2026, 6, 17), date(2026, 7, 10), "ENSDWI"),
    (date(2026, 7, 13), date(2026, 7, 14), "RECAP"),
    (date(2026, 7, 15), date(2026, 8, 7),  "CCFND"),
    (date(2026, 8, 10), date(2026, 8, 11), "RECAP"),
    (date(2026, 8, 12), date(2026, 8, 26), "CSAU"),
    (date(2026, 8, 27), date(2026, 8, 28), "RECAP"),
    (date(2026, 8, 31), date(2026, 10, 9), "ENAUTO"),
    (date(2026, 10, 12), date(2026, 10, 23), "RECAP"),
    (date(2026, 10, 26), date(2026, 10, 30), "BOOTCAMP (R&S)"),
    (date(2026, 11, 2),  date(2026, 11, 13), "RECAP"),
    (date(2026, 11, 16), date(2026, 11, 19), "BOOTCAMP (SDX)"),
    (date(2026, 11, 20), date(2026, 12, 5),  "RECAP"),
    (date(2026, 12, 7),  date(2026, 12, 11), "SIM LAB"),
    (date(2026, 12, 14), date(2027, 1, 15),  "RECAP"),
    (date(2027, 1, 19),  date(2027, 1, 30),  "EXAM"),
]


def _build_module_info(start: date, end: date, name: str, today: date) -> ModuleInfo:
    total_days = (end - start).days + 1
    day_number = max(1, min((today - start).days + 1, total_days))
    days_remaining = max(0, (end - today).days)
    is_current = start <= today <= end

    # Week number within module
    week_number = ((day_number - 1) // 7) + 1

    return ModuleInfo(
        name=name,
        start_date=start.isoformat(),
        end_date=end.isoformat(),
        week_number=week_number,
        day_number=day_number,
        total_days=total_days,
        days_remaining=days_remaining,
        is_current=is_current,
    )


def get_current_module(today: Optional[date] = None) -> Optional[ModuleInfo]:
    if today is None:
        today = date.today()

    for start, end, name in SCHEDULE:
        if start <= today <= end:
            return _build_module_info(start, end, name, today)

    # Between modules — find next
    for start, end, name in SCHEDULE:
        if start > today:
            return _build_module_info(start, end, name, today)

    return None


def get_all_modules(today: Optional[date] = None) -> List[ModuleInfo]:
    if today is None:
        today = date.today()
    return [_build_module_info(s, e, n, today) for s, e, n in SCHEDULE]


def get_progress(recent_sessions: List[StudySessionOut], today: Optional[date] = None) -> ProgressResponse:
    if today is None:
        today = date.today()

    programme_days_total = (PROGRAMME_END - PROGRAMME_START).days + 1
    programme_days_elapsed = max(0, min((today - PROGRAMME_START).days + 1, programme_days_total))
    programme_percent = round((programme_days_elapsed / programme_days_total) * 100, 1)

    return ProgressResponse(
        current_module=get_current_module(today),
        programme_start=PROGRAMME_START.isoformat(),
        programme_end=PROGRAMME_END.isoformat(),
        programme_days_total=programme_days_total,
        programme_days_elapsed=programme_days_elapsed,
        programme_percent=programme_percent,
        recent_sessions=recent_sessions,
        all_modules=get_all_modules(today),
    )
