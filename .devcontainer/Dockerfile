FROM node:24-trixie

USER root

# Install Python tooling and pre-commit
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --break-system-packages && \
    pip install --break-system-packages --ignore-installed pre-commit

# Install OpenCode CLI globally (postinstall selects native binary)
RUN npm install -g @opencode/cli

WORKDIR /home/node/app

USER node

# Symlink project opencode.json into OpenCode's config directory
RUN mkdir -p /home/node/.config/opencode && \
    ln -s /home/node/app/.devcontainer/opencode.json /home/node/.config/opencode/opencode.json
