#!/bin/sh

while ! nc -z redis 6379; do sleep 1; done
while ! nc -z postgres 5432; do sleep 1; done

if [ "$1" = gunicorn ]
then
    ./manage.py migrate
    ./manage.py collectstatic --no-input
    gunicorn --bind 0.0.0.0 tutochan.wsgi
elif [ "$1" = daphne ]
then
    daphne -b 0.0.0.0 -p 8000 tutochan.asgi:application
elif [ "$1" = test ]
then
    while ! nc -z selenium 4444; do sleep 1; done
    ./manage.py test
fi
