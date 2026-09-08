VOLTEX ELECTRICALS — COMPLETE WEBSITE REDESIGN BRIEF

You are redesigning the existing Voltex Electricals website.

Before touching the code, inspect the entire existing project, understand the current architecture, data structure, routes, components, CSS, product JSON/data files, images, and existing functionality. Do not blindly rewrite the application.

The current website is functional, but its visual direction is too dark, gloomy, technical, and difficult to navigate.

The goal is to transform it into a bright, premium, modern electrical-products catalogue/e-commerce experience that feels easy to browse even when the catalogue becomes very large.

Use the following websites as design inspiration:

https://faberindia.com/
https://orientelectric.com/
https://www.philips.co.in/

Do NOT copy their branding, exact layouts, wording, or proprietary design. Study their information architecture, product discovery, category hierarchy, spacing, navigation, product presentation, and accessibility and create an original Voltex design.

PHASE 1 — PLAN FIRST

DO NOT START CODING IMMEDIATELY.

First inspect the complete codebase and produce a detailed implementation plan.

The plan must cover:

Current application architecture.
Current homepage structure.
Current product data structure.
Current category structure.
Current brand structure.
Existing routes/pages.
Existing reusable components.
Existing CSS/design system.
Existing filtering/search functionality.
Existing product detail functionality.
What can be reused.
What must be redesigned.
What should be removed.
What new components are required.
How the website should scale from the current small dataset to hundreds or thousands of products.

Do not make destructive architectural changes without understanding the existing system.

After analyzing the project, create a clear page-by-page and component-by-component redesign plan.

Then execute that plan.

CORE BUSINESS CONTEXT

Voltex Electricals is NOT an Orient-only website.

This is extremely important.

Voltex is a multi-brand electrical products catalogue.

Current / future brands include brands such as:

Orient
Wipro
Philips
Crompton
Starlight
ACE Pro
Mighty Power
Atomberg
Havells
and other brands that may be added later.

The website must therefore be designed from day one as a multi-brand marketplace/catalogue, not as a single-brand store.

Do not hard-code the UI around Orient.

Do not use Orient branding as the visual identity of the entire website.

Orient should simply be one of many brands available in the catalogue.

The architecture should allow additional brands to be added without redesigning the website.

REMOVE THE CURRENT VISUAL DIRECTION

The existing Voltex website currently has a very dark charcoal/black catalogue aesthetic.

I do NOT want that anymore.

Remove or substantially redesign:

the overwhelmingly dark background
the gloomy appearance
excessive black/charcoal sections
the current circular/curved product showcase
the "spinning/circling cards" visual treatment
the overly technical catalogue appearance
unnecessary decorative complexity
confusing horizontal product presentations
the current Fans / Lighting / Brands header navigation
any design that makes the catalogue feel like a developer-made prototype

The new website should feel like a professional Indian electrical-products company with a large catalogue, not like a dark experimental portfolio website.

NEW VISUAL DIRECTION

Create an identity that feels:

Bright + Electrical + Modern + Friendly + Premium + Easy to Navigate

The primary background should generally be:

white
warm white
very light neutral
light grey

Use dark text for readability.

Use the Voltex accent color sparingly.

The visual language should be inspired by the physical world of electrical products.

Think:

switches
electrical sockets
bulbs
LEDs
illuminated buttons
indicator lights
subtle backlighting
electrical panels
wiring
clean power/electricity motifs
soft glows
warm/cool light gradients

But DO NOT turn the website into a gimmicky "electricity themed" website.

These elements should be subtle.

The site should still look like a serious premium commercial website.

IMPORTANT DESIGN PRINCIPLE

The website should communicate:

"We have a huge range of electrical products from many brands, and finding the exact thing you need is easy."

That should be the primary design objective.

The website should prioritize product discovery and accessibility over decorative animation.

HEADER / NAVIGATION

Completely redesign the current header.

REMOVE:

Fans
Lighting
Brands

as separate primary top-level header links.

The header should NOT become a massive list of every category.

Instead use a much cleaner navigation structure.

Recommended structure:

VOLTex logo

Then:

Products
Categories
Brands
About
Contact

And on the right:

Search
Account if existing
Cart if existing

The primary "Products" or "Categories" navigation should open a proper mega-menu / category explorer.

The header should feel clean and extremely easy to understand.

MEGA MENU

Create a proper product navigation system.

For example:

PRODUCTS

Fans
Ceiling Fans
Exhaust Fans
Pedestal Fans
Table Fans
Wall Fans
Industrial Fans
Metal Fans
Decorative Fans

Lighting
Downlights
Spotlights
Panel Lights
Backlit Lights
Elevation Lights
Wall Lights
Bulbs
Lamps
Track Lights
Outdoor Lights
etc.

Electrical
Switches
Switchboards
Sockets
MCB / Switchgear
Wiring Accessories
etc.

Other categories
according to the actual available catalogue data.

Do NOT invent categories that aren't supported by the product data.

Build the navigation dynamically from the actual product/category data where practical.

HOMEPAGE STRUCTURE

The homepage should no longer be a generic dark catalogue.

Build a premium commercial homepage with a clear hierarchy.

Suggested structure:

1. HERO

Large, visually striking hero area.

Use beautiful product photography.

Possible concept:

"EVERYTHING ELECTRICAL.
ONE PLACE."

or similar.

Supporting text should clearly communicate:

Multiple brands.
Hundreds of products.
Fans, lighting, switches and electrical essentials.

Primary CTA:

Explore Products

Secondary CTA:

Browse Categories

The hero should be product-oriented rather than overly corporate.

Consider subtle lighting effects / glow / bulb illumination.

2. SHOP BY CATEGORY

Immediately after the hero, create a major category discovery section.

Title:

Shop by Category

Display large, attractive category cards.

For example:

FANS
LIGHTING
SWITCHES
SWITCHGEAR
WIRING
ELECTRICAL ACCESSORIES

Use product imagery for each category.

The cards should NOT be circular.

Use clean rectangular or softly rounded cards.

Allow hover interaction:

image movement
subtle shadow
subtle glow
arrow appears
card elevation

Nothing excessive.

3. DEEP CATEGORY EXPLORATION

When someone selects:

FANS

they should NOT immediately get a giant list of random fans.

First show:

Choose Your Fan

with category options:

Ceiling Fans
Exhaust Fans
Pedestal Fans
Table Fans
Wall Fans
Industrial Fans
Metal Fans
Decorative Fans
etc.

Each category should have:

representative image
category name
number of products

Example:

Ceiling Fans
47 Products

Exhaust Fans
9 Products

Pedestal Fans
12 Products

etc.

This is extremely important for usability.

4. AFTER CATEGORY SELECTION

Example:

User clicks:

Exhaust Fans

Now show a proper catalogue/product listing page.

At the top:

EXHAUST FANS

"Explore exhaust fans from multiple brands."

Then:

Filters
Sort
Search

Product grid.

PRODUCT GRID

The product grid must become one of the strongest parts of the website.

Each product card should contain:

PRODUCT IMAGE

BRAND LOGO

BRAND NAME

PRODUCT NAME

SHORT PRODUCT INFORMATION

OPTIONAL:
price / enquiry / availability depending on current functionality

CTA:

View Product

Do not make the product card overly complicated.

BRAND VISIBILITY

Brand recognition is VERY important.

When looking at a product, the visitor should immediately know:

Which company makes this product?

For example:

[Orient Logo]

Orient

Aeon Antidust BLDC Ceiling Fan

or

[Philips Logo]

Philips

LED Panel Light

Use actual brand logos where available in the existing data/assets.

Build the component so that new brands can be added dynamically.

DO NOT visually favor Orient.

Every brand must have equal structural importance.

BRAND SYSTEM

Create a proper Brands page.

Example:

BRANDS WE CARRY

Orient
Wipro
Philips
Crompton
Havells
Atomberg
Starlight
ACE Pro
Mighty Power
etc.

Each brand should have:

logo
number of products
category coverage
link to browse brand

Example:

Orient
100 Products

Philips
XX Products

Crompton
XX Products

etc.

Make this dynamic.

PRODUCT DETAIL PAGE

When a visitor clicks a product:

Create a premium product detail layout.

Include:

Large product image/gallery

Brand logo

Brand name

Product name

Product category

Model number if available

Product specifications

Features

Technical details

Available variants

Documents/catalogue if available

Enquiry/contact CTA

Related products

More from this brand

Do not make product details feel like a boring database table.

Use cards, sections, icons and clean typography.

SEARCH

Search must be treated as a major feature.

Create a prominent search experience.

The user should be able to search:

product name
model number
brand
category
product type

Example:

"1200mm ceiling fan"

"Atomberg fan"

"Philips panel light"

"exhaust fan"

Search results should be fast and clean.

FILTERING

Product listing pages should support useful filters based on actual available data.

Examples:

Brand
Category
Type
Size
Wattage
Colour
Voltage
Speed
Technology
etc.

BUT:

Only show filters when the underlying product data contains those attributes.

Do not create fake/non-functional filters.

DESIGN SYSTEM

Create a proper Voltex design system.

Use:

Base

Warm white / white backgrounds

Very dark navy/charcoal text

Soft grey borders

Accent

Orange / amber electrical accent.

Use it for:

active states
buttons
highlights
electrical glow effects
small visual details

Do NOT make everything orange.

Lighting effects

Subtle:

warm bulb glow
cool LED glow
soft radial gradients
illuminated indicators

These should reinforce the electrical theme.

SWITCH-INSPIRED UI

One of the visual inspirations should be electrical switches.

Buttons can subtly resemble premium electrical switches.

For example:

Normal state:

[ EXPLORE PRODUCTS ]

Hover:

slight illumination / indicator-light effect

Selected filters could look like physical toggle switches.

But keep everything modern.

DO NOT create literal skeuomorphic switches everywhere.

The inspiration should be subtle.

LIGHT / BULB MOTIFS

Use lighting intelligently throughout the design.

Possible examples:

small glowing bulb icon beside section headings
LED-style active indicators
subtle light gradients
illuminated hover states
tiny "power-on" status dots
switch-like navigation controls

These should create a recognizable Voltex visual identity.

TYPOGRAPHY

Move away from the current overly technical typography.

Use a modern, highly readable font system.

Large headings should feel:

premium
clean
modern
confident

Body text should be extremely readable.

The website should be accessible to ordinary customers, not just technical users.

Avoid excessive uppercase text.

Use uppercase primarily for labels and small metadata.

SPACING

Use generous whitespace.

Do not pack the screen with information.

The site should feel:

clean
organized
breathable

Every section should have an obvious purpose.

PRODUCT IMAGERY

Product imagery is extremely important.

Use existing product assets from the project.

Do not replace product images with random placeholders if actual product images exist.

Keep product images on clean, light surfaces.

Product cards should have consistent image areas.

Avoid inconsistent image sizes destroying the grid.

Use proper object-fit behavior.

RESPONSIVENESS

The website must work beautifully on:

Desktop
Laptop
Tablet
Mobile

Do not merely shrink the desktop website.

Mobile should have a proper navigation experience.

Category browsing should remain very easy on mobile.

Product cards should remain readable.

Filters should become a mobile drawer/bottom sheet where appropriate.

ACCESSIBILITY

Prioritize accessibility.

Ensure:

strong text contrast
visible buttons
clear hover/focus states
keyboard navigation
readable typography
touch-friendly controls
meaningful labels
alt text for images
no inaccessible tiny text

The website should feel easy to use for someone who has never visited it before.

ANIMATION

Use animation, but carefully.

Preferred:

subtle fade-in
slight slide
image scale on hover
soft product-card elevation
lighting/glow transitions
smooth menu transitions

Avoid:

spinning product carousels
excessive 3D
constant movement
distracting animations
gimmicky page transitions

The current circular/rotating product-card concept should be REMOVED.

HOMEPAGE PRODUCT SECTIONS

After category discovery, introduce curated product collections.

Examples:

Trending Products

New Arrivals

Popular Fans

Featured Lighting

Latest Switches & Accessories

Explore by Brand

Each should use horizontal product cards or grids appropriate to the content.

"SHOP BY NEED"

Consider an additional discovery section that helps users who don't know the technical category.

Examples:

Cooling
Lighting
Home Electrical
Commercial Electrical
Industrial
Energy Saving

This should only be implemented when it makes sense with the actual catalogue.

BRAND-NEUTRAL EXPERIENCE

This is one of the most important requirements.

The website should never feel like:

"Voltex = Orient."

It must feel like:

"Voltex = a place where I can discover electrical products from many brands."

Orient is one supplier/brand among many.

Therefore:

do not use Orient colors throughout the site
do not make Orient the default brand
do not create the homepage around Orient products
do not hard-code Orient data into components
do not use Orient as the only example in important UI sections when multiple brands exist

Use the actual catalogue data to dynamically populate content.

DATA ARCHITECTURE

Design the frontend around a normalized product structure.

At minimum products should be able to contain:

id
name
brand
brandLogo
category
subcategory
type
images
description
specifications
features
modelNumber
variants
tags

and any additional relevant properties already present in the existing data.

Brands should be separate entities wherever practical.

Categories should be hierarchical.

Example:

Fans
→ Ceiling Fans
→ BLDC Fans
→ Decorative Fans

Lighting
→ Panel Lights
→ Backlit Panels

etc.

The exact hierarchy must be based on the actual catalogue.

FUTURE SCALABILITY

The website currently has limited product data, but more data will be added.

Build the UI so that adding:

100 products
500 products
1,000+ products

does not require redesigning the frontend.

Do not hard-code:

number of products
number of brands
category counts

Calculate those from the actual data.

Example:

Do NOT write:

"100 PRODUCTS"

when there may later be 250.

Instead calculate:

${products.length} PRODUCTS

or equivalent.

IMPORTANT CURRENT DATA PROBLEM

The existing project currently appears heavily centered around Orient data.

Fix this architectural/design issue.

The current UI should NOT look like an Orient online store.

Once additional product files are introduced, the website should automatically incorporate them into:

category counts
brand counts
product grids
search
filters
brand pages
related products
homepage collections

Do not require manually rewriting components when new brands/products are added.

FOOTER

Create a much cleaner professional footer.

Include:

Voltex Electricals

Short company description

Products

Categories

Brands

Company

Contact

Quick links

Enquiry/contact CTA

Social links if already supported

Legal links if available

Do not make it excessively tall.

HOMEPAGE VISUAL HIERARCHY

The finished homepage should broadly feel like:

HEADER

↓

HERO

↓

SHOP BY CATEGORY

↓

POPULAR / FEATURED PRODUCTS

↓

EXPLORE PRODUCT TYPES

↓

BRANDS

↓

FEATURED / NEW PRODUCTS

↓

WHY VOLTEX

↓

CONTACT / ENQUIRY

↓

FOOTER

Do not blindly follow this exact order if the existing data/application suggests a better structure.

The point is to make the journey obvious.

VERY IMPORTANT: INFORMATION ARCHITECTURE

Think about the website from the perspective of a normal customer.

A customer should be able to answer these questions immediately:

"What does Voltex sell?"

"Do you have the type of product I need?"

"What brands do you carry?"

"Which types of fans do you sell?"

"Which types of lights do you sell?"

"Can I find a particular model?"

"Which company makes this product?"

"How do I contact Voltex?"

The website should answer those questions visually without requiring the user to explore blindly.

DO NOT OVERDESIGN

Avoid making the website look like:

a futuristic gaming website
a cyberpunk website
a developer portfolio
a dark SaaS dashboard
an experimental 3D website
an animation showcase

It is a commercial electrical products catalogue.

It should look expensive and polished, but practical.

REFERENCE PHILOSOPHY

From Orient:

Take inspiration from:

clear category hierarchy
"shop by product"
product-type discovery
brand/product organization
large catalogue handling

From Faber:

Take inspiration from:

clean commercial presentation
strong visual sections
category-first browsing
product-led homepage

From Philips:

Take inspiration from:

strong information architecture
broad product taxonomy
search/discovery
professional presentation
easy navigation through a large product ecosystem

Then create an original VOLTEX ELECTRICALS design language.

IMPLEMENTATION RULE

FIRST:

Inspect codebase.
Understand architecture.
Inspect all product data.
Inspect existing components.
Produce redesign plan.
Identify reusable components.
Identify components to replace.
Identify missing functionality.
Plan responsive behavior.
Plan data architecture.

THEN:

Execute the redesign.

Do not stop after changing colors.

This is a full UX/UI redesign, not a simple CSS makeover.

FINAL QUALITY CHECK

Before considering the work complete, test:

Desktop
Tablet
Mobile

Test:

Homepage
Categories
Fans
Lighting
Product type pages
Brand browsing
Search
Filters
Product detail
Navigation
Mobile menu

Check for:

broken links
empty states
missing images
incorrect counts
layout overflow
inconsistent card sizes
poor mobile spacing
slow/unnecessary animations
hard-to-read text
incorrect brand associations

Most importantly:

Open the homepage as a completely new visitor.

Ask:

"Can I understand what this company sells within 5 seconds?"

"Can I find Fans → Ceiling Fans → products from multiple brands without confusion?"

"Can I identify the brand of every product?"

"Does the website feel like a professional electrical-products company?"

"Does it feel easy to browse hundreds of products?"

If the answer to any of these is no, continue improving the interface.

END GOAL

The finished Voltex website should feel like:

A modern, bright, premium electrical marketplace/catalogue where customers can effortlessly discover products across categories, subcategories and brands.

It should have a recognizable Voltex visual identity based around:

light + switches + electricity + clean product photography + subtle illumination

while remaining professional, fast, accessible and easy to navigate.

Do not preserve the existing dark/circular catalogue design merely because it already exists.

Rebuild the visual experience around the user's browsing journey.