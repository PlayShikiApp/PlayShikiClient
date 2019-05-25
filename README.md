# PlayShikiClient
A client-side part of PlayShikimoriApp

# Configuration

Install dependencies
```
cd ../PlayShikiClient
npm install
sudo npm install -g pkg
```

Generate *.js keys (key.priv and key2.priv must match keys used on [server](https://github.com/PlayShikimoriApp/PlayShikiServer)):
```
./utils/genkeys.py key.priv keys/key.js
./utils/genkeys.py key2.priv keys/key2.js
```

Configure host address and port in .env file
```
HOST=127.0.0.1
PORT=8100
```

# Client app packaging and run
```
cd ../PlayShikiClient
pkg .
```

Run Shikimori.exe and leave it running in background.
