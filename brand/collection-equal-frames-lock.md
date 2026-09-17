# Collection / Home cards — equal image frames
**Jeff 2026-09-16** · Emily · Via Andy · Wes

## Lock
All listing card images must be **the same size** — fixed aspect frame; image uses `object-fit: contain` (full saddle visible) centered on white/`#FFFFFF`.

## Spec
- Frame aspect: **4:5** — identical width + height for every card
- `object-fit: contain`; `object-position: center`
- Background inside frame: white (showroom ground)
- Do **not** use `cover` if it crops differently per saddle
- Grid alignment: shared row height; no card taller because of image intrinsic ratio

## Don’t
- Intrinsic-height images driving uneven card chrome
