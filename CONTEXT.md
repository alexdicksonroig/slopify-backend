# Slopify

The commerce domain for managing and presenting products offered through Slopify.

## Language

**Product Thumbnail**:
The optional image that visually represents a Product in compact views such as catalog lists, carts, and summaries.
_Avoid_: Primary image, product image

**Product Option**:
A configurable dimension with a fixed set of possible values and an untranslated English label that the frontend translates. For example, a Color Product Option can offer Red and Blue.
_Avoid_: Variant, SKU

**Product Variant**:
A sellable combination of values from the Product Options used by a Product. A Product can have multiple Product Variants; each uses the same Product Options, and duplicate combinations are not allowed.
_Avoid_: Product Option, Variant Selection

**SKU**:
The unique, non-blank identifier for a Product Variant.
