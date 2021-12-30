## Development building / running

This app is built using Electron.
Make sure you have at least Node v12. The app uses ffmpeg from PATH when developing.

```bash
npm install -g yarn
```

```bash
git clone https://github.com/mifi/lossless-cut.git
cd lossless-cut
yarn
```
Note: `yarn` may take some time to complete.

### Running
```bash
npm run download-ffmpeg # on MacOS only

npm start
```

## Release

### Release new version

- Commit changed
- `npm version ...`
- `git push && git push --tags`
- Wait for build and draft in Github actions
- Release draft at github
- Bump [snap version](https://snapcraft.io/losslesscut/listing)
- `npm run scan-i18n` to get the newest Englist strings and push so weblate gets them


## Source Copy progress bar
```
cd ~/Downloads
wget http://ftp.gnu.org/gnu/coreutils/coreutils-8.32.tar.xz
tar xvJf coreutils-8.32.tar.xz
cd coreutils-8.32/
patch -p1 -i ../lossless-cut/patches/advcpmv-0.8-8.32.patch
./configure
make
```
cp and mv files are patched