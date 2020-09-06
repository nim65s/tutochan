from django.conf import settings
from django.db import models

from ndh.models import Links, NamedModel, TimeStampedModel


class Chan(TimeStampedModel, NamedModel, Links):
    pass


class Message(TimeStampedModel):
    chan = models.ForeignKey(Chan, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()

    def __str__(self):
        return f'{self.chan} | {self.created:%x %X} - {self.user}: {self.message}'
