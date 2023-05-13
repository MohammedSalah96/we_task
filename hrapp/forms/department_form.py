from django import forms

from hrapp.models.department import Department


class DepartmentForm(forms.ModelForm):
    class Meta:
        model = Department
        fields = "__all__"
