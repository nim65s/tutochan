# Tuto Chan

Just following https://channels.readthedocs.io/en/latest/tutorial/index.html

Might add stuff later.


## Launch all the things

```bash
echo SECRET_KEY=$(openssl rand -base64 32) >> .env
echo POSTGRES_PASSWORD=$(openssl rand -base64 32) >> .env
docker-compose up -d --build daphne
```

## Start the tests

```bash
docker-compose up --build --exit-code-from test
```
