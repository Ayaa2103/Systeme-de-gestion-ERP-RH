# Generated manually to add created_at field to Training model

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0003_traininginvitation'),
    ]

    operations = [
        migrations.AddField(
            model_name='training',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True, blank=True),
        ),
    ]