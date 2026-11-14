FROM node:24-trixie

USER root

# Install Python tooling and pre-commit
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --break-system-packages && \
    pip install --break-system-packages --ignore-installed pre-commit

# Install OpenCode CLI globally (postinstall selects native binary)
RUN npm install -g @opencode/cli

# Install GitHub CLI
RUN apt-get update && apt-get install -y gh

WORKDIR /home/node/app

# Symlink project opencode.json into OpenCode's config directory (works for root and node users)
RUN mkdir -p /home/node/.config/opencode /root/.config/opencode && \
    ln -sf /home/node/app/.devcontainer/opencode.json /home/node/.config/opencode/opencode.json && \
    ln -sf /home/node/app/.devcontainer/opencode.json /root/.config/opencode/opencode.json
