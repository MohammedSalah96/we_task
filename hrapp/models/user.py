from django.db import models

from .base_model import BaseModel
from .department import Department


class User(BaseModel):
    code = models.BigIntegerField(unique=True, blank=True)
    username = models.CharField(max_length=400, blank=False)
    mobile = models.CharField(max_length=20, blank=False, unique=True)
    email = models.EmailField(max_length=320, blank=False, unique=True)
    dob = models.DateField(blank=False)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        null=False,
        db_column='department_id',
        related_name= 'department'
    )

    class Meta:
        app_label = BaseModel.app_label
        db_table = 'users'

    def save(self, *args, **kwargs):
        if self._state.adding and not self.code:
            user = User.objects.last()
            if user:
                self.code = int(user.code) + 1
            else:
                self.code = 1
        super().save(*args, **kwargs)
