FROM node:24-trixie

USER root

RUN apt update && apt install -yqq python3.13 python3.13-venv python3-pip && \
    ln -s /usr/bin/python3.13 /usr/bin/python

RUN pip install --break-system-packages pre-commit
RUN npm install -g @google/gemini-cli

WORKDIR /home/node/app

USER node
