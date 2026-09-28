# The Local Discovery Box — Shopify Theme (Online Store 2.0)

A bespoke Shopify Online Store 2.0 theme built to replicate the branding, playful retro neo-brutalism design system, and full interactive functionality of **[Local Discovery Box](https://localdiscoverybox.com/)**.

---

## 🎨 Theme Highlights & Visual Design System

- **Playful Neo-Brutalist Pop Aesthetic**:
  - Chunky solid borders (`border-2 border-ink` with `#00174F` deep navy).
  - Tactile offset drop shadows (`4px 4px 0 0 #00174F` for cards, `7px 7px 0 0` for prominent blocks, `2px 2px 0 0` for badges and buttons).
  - Button micro-interactions: active translate press state (`translate(2px, 2px)`).
  - Card variations with playful rotation tilts (`-rotate-1`, `rotate-1`, `-rotate-2`, `rotate-2`).
  - Warm retro color palette:
    - **Ink**: `#00174F`
    - **Cream**: `#FFFDF8` (Soft warm page background)
    - **Paper**: `#FFFFFF` (Card container fill)
    - **Coral**: `#FF6B5A` (Primary CTA and attention pop)
    - **Teal**: `#7AE2CE` (Secondary accents & pills)
    - **Sun**: `#FFD166` (Yellow callouts and highlight badges)
    - **Berry**: `#795290` (Purple accents)
  - Typography: **Fredoka** & **Baloo 2** for bold display headings, **Poppins** for readable sans-serif body text.
  - Character Mascots: **Lo the Strawberry** and **Finn the Squirrel Scout**.

---

## 📦 Shopify Subscription App Integration

This theme is designed for subscription commerce using **Shopify's Native Selling Plans API**, which powers the official **Shopify Subscriptions App**, as well as ReCharge, Bold Subscriptions, Seal Subscriptions, and Appstle.

### How Subscriptions Work in This Theme:
1. **Single Box & Subscription Toggle**:
   - On the product page (`product.json` / `sections/main-product.liquid`), users can choose between:
     - **One-Time Box**: $59 (no commitment)
     - **Season Pass Subscription**: Save 15% ($50.15 / quarter, delivered every 3 months)
   - Automatically loops through `product.selling_plan_groups` and assigns the chosen selling plan ID to the cart form.
2. **Dedicated Subscribe Page** (`page.subscribe.json` / `sections/subscribe-plans.liquid`):
   - Features 4 distinct plans:
     - **Season Pass — One Region** ($69 / quarter)
     - **Season Pass — Rotating Regions** ($69 / quarter, Most Popular)
     - **Year of Discovery — One Region** ($260 / year)
     - **Year of Discovery — Rotating Regions** ($260 / year)
   - Clicking any plan passes the chosen selling plan ID, selected region (`properties[Region]`), and billing cadence to the Shopify Cart via AJAX and opens the slide-out Cart Drawer.
3. **Slide-Out AJAX Cart Drawer** (`snippets/cart-drawer.liquid`):
   - Displays selling plan badges (e.g. `★ Season Pass (Quarterly)`).
   - Displays custom line item properties (`Region: Southwest Virginia`).
   - Free shipping progress bar ($50 threshold).
   - Real-time quantity adjustments and direct link to Shopify Checkout.
4. **Customer Account Portal** (`templates/customers/account.liquid`):
   - "My Boxes" dashboard displaying active subscriptions, renewal dates, and direct links to manage subscriptions via Shopify's customer portal.

---

## 🚀 How to Install into Your Shopify Store

### Step 1: Upload the Theme
1. In your Shopify Admin, navigate to **Online Store > Themes**.
2. Under the **Theme library** section, click **Add theme > Upload zip file**.
3. Select `localdiscoverybox-shopify-theme.zip` from your computer and upload.
4. Click **Actions > Publish** when you're ready to make it live (or click **Customize** to edit in preview mode).

### Step 2: Configure Your Box Product & Subscriptions
1. In Shopify Admin, navigate to **Products > Add product**.
2. Title: `The Local Discovery Box` (or `Southwest Virginia Edition`).
3. Set your price (e.g. `$59.00`).
4. Install the free **Shopify Subscriptions** app from the Shopify App Store (or your preferred subscription app).
5. In the product page in Shopify Admin, scroll to **Purchase options** and click **Add subscription plan**.
   - Create a **Quarterly plan**: e.g., "Deliver every 3 months", with an optional 10% or 15% discount.
   - Create an **Annual plan**: e.g., "Deliver every 12 months".
6. In **Online Store > Themes > Customize**, under **Theme settings > Cart & Subscriptions**, select your newly created box product as the default featured box.

### Step 3: Create the Pages
In **Online Store > Pages**, create the following pages and assign their matching theme templates in the right sidebar:
| Page Title | URL Handle | Theme Template |
| :--- | :--- | :--- |
| **Subscribe** | `/pages/subscribe` | `page.subscribe` |
| **For Brands** | `/pages/for-brands` | `page.for-brands` |
| **States & Regions** | `/pages/regions` | `page.regions` |

---

## 🖥️ Local Preview Demo

To preview the theme locally without an active Shopify development store:
1. Open `preview/index.html` in any web browser.
2. Use the interactive top bar to switch between the 5 template views:
   - **1. Homepage** (Hero, scarcity meter, marquee, 6 brand cards, what ships, benefits, testimonials, final CTA)
   - **2. Get The Box / Product** (Purchase options, one-time vs subscription toggle, quantity calculator, order summary)
   - **3. Subscribe Plans** (4 seasonal subscription tiers, region dropdowns, 1-click cart addition)
   - **4. For Brands** (Maker metrics, 4 steps, business categories, application contact form, FAQ accordion)
   - **5. States & Regions** (Live and upcoming regional editions with interactive waitlist and maker nomination modals)
   - **Cart Drawer Button** (Slide-out drawer with free shipping tracker and subscription badges)
