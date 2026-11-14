FROM node:24-trixie

USER root

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --break-system-packages && \
    pip install --break-system-packages --ignore-installed pre-commit

WORKDIR /home/node/app

USER node
