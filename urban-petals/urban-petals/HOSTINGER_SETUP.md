# Urban Petals Hostinger Setup

## 1. Create the database

In Hostinger hPanel:

1. Go to `Websites`.
2. Open your site dashboard.
3. Go to `Databases -> MySQL Databases`.
4. Create a database, username, and password.

## 2. Upload the project

Upload everything inside this `urban-petals` folder to `public_html`.

Important folders:

- `api/`
- `css/`
- `images/`
- `js/`
- all `.html` files

## 3. Configure database access

Open `api/config.php` and replace:

- `CHANGE_ME_DATABASE`
- `CHANGE_ME_USER`
- `CHANGE_ME_PASSWORD`

Optional:

- change `install_token` to your own secret string

## 4. Run the installer

Open this in your browser:

`https://your-domain.com/api/install.php?token=urban-petals-setup-2026`

If you changed the token in `api/config.php`, use your new token instead.

The installer will:

- create the tables
- seed demo admin accounts
- seed demo products
- seed demo orders

## 5. Test admin login

Demo accounts created by the installer:

- `maria.admin@urbanpetals.ph` / `ChangeMe123!` / `EMP-001`
- `jose.admin@urbanpetals.ph` / `ChangeMe123!` / `EMP-002`
- `ana.staff@urbanpetals.ph` / `ChangeMe123!` / `EMP-003`

Use the `Employee` option on `Signin.html` for admin access.

## 6. Recommended after first install

1. Change the demo account passwords.
2. Change the `install_token`.
3. Remove or rename `api/install.php` after setup if you do not need it anymore.
