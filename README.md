# Larpantom Wallet

Static GitHub Pages wallet mockup built mainly for iPhone Safari. It has no build step and no dependencies.  https://matvqi.github.io/larpantom-wallet/

## Customize

- Edit `config.js` to change the default wallet name, balance, accent color, receive address, and assets.
- Or open the site, tap the gear, and edit the regular fields. Changes are applied immediately and saved in the browser with `localStorage`.
- Asset logos can use the built-in values `solana`, `hulvin`, `usdt`, `setosi`, or `polygon`. You can also add an `image` URL/path to any asset object.

## Deploy To GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `config.js`, `app.js`, and `README.md`.
3. In GitHub, open `Settings > Pages`.
4. Set source to `Deploy from a branch`.
5. Select `main` and `/root`, then save.

GitHub Pages will serve the site after the deployment finishes.
