from hrapp.models.department import Department

from .base_repository import BaseRepository


class DepartmentRepository(BaseRepository):
    model = Department