from rest_framework import serializers

from .models import Chan, Message


class ChanSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Chan
        fields = ['url', 'name', 'created']


class MessageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Message
        fields = ['url', 'chan', 'user', 'message', 'created']
