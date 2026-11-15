FROM node:24-trixie

USER root

# Install Python tooling and pre-commit
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --break-system-packages && \
    pip install --break-system-packages --ignore-installed pre-commit

# Install OpenCode CLI globally (postinstall selects native binary)
RUN npm install -g @opencode/cli

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y --no-install-recommends gh && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/node/app

# Symlink project opencode.json into OpenCode's config directory (works for root and node users)
RUN mkdir -p /home/node/.config/opencode /root/.config/opencode && \
    ln -sf /home/node/app/.devcontainer/opencode.json /home/node/.config/opencode/opencode.json && \
    ln -sf /home/node/app/.devcontainer/opencode.json /root/.config/opencode/opencode.json
