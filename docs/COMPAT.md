\# COMPAT — Наблюдения по Windows/Linux



\## Требования



\- \*\*Node.js:\*\* 20.19+ или 22.12+

\- \*\*npm:\*\* 10+

\- \*\*ОС:\*\* Windows 10/11, Linux (Ubuntu 20.04+), macOS 12+



\## Установка



\### Windows



1\. Установить \*\*Node.js LTS\*\* с https://nodejs.org/ (`.msi`, 64-bit).

2\. Или использовать \*\*nvm-windows\*\* (рекомендуется):

&#x20;  - Скачать с https://github.com/coreybutler/nvm-windows/releases

&#x20;  - `nvm install lts`

&#x20;  - `nvm use lts`

3\. Проверить: `node -v`, `npm -v`.



\### Linux



```bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

source \~/.bashrc

nvm install --lts

nvm use --lts

