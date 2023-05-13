from django.db import models

from .base_model import BaseModel


class Department(BaseModel):
    code = models.BigIntegerField(unique=True, blank=True)
    name = models.CharField(max_length=400, unique=True, blank=False)

    class Meta:
        app_label = BaseModel.app_label
        db_table = 'departments'

    def save(self, *args, **kwargs) -> None:
        if self._state.adding and not self.code:
            department = Department.objects.last()
            if department:
                self.code = int(department.code) + 1
            else:
                self.code = 1
        super().save(*args, **kwargs)
