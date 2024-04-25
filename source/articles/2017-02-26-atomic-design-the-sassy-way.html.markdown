---
title: Atomic Design the Sassy Way
date: 2017-02-26 23:52 UTC
tags: Sass, Atomic Design
summary: Atomic design and Sass...the perfect pair.
---

I wrote this awhile ago for the folks at BloomBoard. UX, Design, and Dev all owned the styles so good collaboration and thought around how to break things down was key to keeping our code maintainable. Over the years we became even more dilligent about how to break apart pieces, and this article was the kickstarter.


# Writing Sass the atomic way

When building a UI its important to go through the process of breaking down the components into small re-useable bits. This is crucial when building UI, but even more important when trying to build and maintain a design system. The process of breaking things down, naming things right, and documentatation is key to a successful Sassy stack.


---

## Breaking bad 

You don't need to be an expert at sass or atomic design to start breaking the ui apart. Start with separating layout from the UI. Flex props, floats, widths and percentages are a good indicator of something that has layout. Things that have layout are generally at the page level, or an organism. When done right atoms and molecules can stand alone, but may not be positioned quite right. This is common if we've done our job right. See this example below.


```sass
// organism (mostly layout properties)
.data-list
  width: 500px
  margin-top: 10px
  // organism takes responsibility of positioning & layout of atoms and molecules
  .list-item
    margin-bottom: 10px
    width: 90%

// molecule (self contained, but not including layout)
.list-item
  background: #fff
  padding: 10px
  border-bottom: 1px solid #ccc
  // molecule takes responsibility of positioning & layout of atoms
  .list-item-title
    margin-top: 10px
  
// atom (very small and can stand alone)
.list-item-title
  color: blue
  font-size: 14px
```


In the example the organism takes responsibility of positioning & layout of atoms and molecules. The molecule again stands alone and should be without layout. However the molecule controlls it's childern and positions atoms contained inside.

Atoms are awesome and the most re-usable ui element, but 99% of the time they are paired within a molecule or organism. Rarely do they completely stand alone.

Here's another example:

#### Page:
![](http://s.jasoncypret.com/1f043B222W0N/Image%202016-06-07%20at%2010.40.03%20AM.png)
Page level overrides. Should be fairly small, but used for orchestration of all elements.

#### Organism:
![](http://s.jasoncypret.com/372m3Q2Z140F/Image%202016-06-07%20at%2010.34.25%20AM.png)
Reusable and can be dropped on any page. Great examples are lists, galleries, and results.

#### Molecule:
![](http://s.jasoncypret.com/1m3V0N372G2D/Image%202016-06-07%20at%2010.39.11%20AM.png)


#### Atoms:
![](http://s.jasoncypret.com/0D2x0I101927/Image%202016-06-07%20at%2010.37.51%20AM.png)


Foreach/while statements are a great indicator that a organisms and molecules are needed. Typically the parent of the "foreach" is the organism and the "loop" is a molecule.

Figuing out organisms are pretty easy. Does it control layout? Ok, can that layout be reused, or is it specific to a page/view? If it can be reused, make it an organism. If it chas no reuse, add it to the page.



---

## The Name Game

Naming is an art. When is it best to chain a class, when to prefix. When to be specific, when to be generic. Here are some guidelines and helpers to help make naming a bit more clear. 

Lets discuss prefixed classes and style bleeding, and chained classes first. Unexpected styles can occur when classes are changed together. `class="pod green error disabled"` Bleeding refers to the mixing of styles or behavior from one component to another. 

Taking the chained classes approach, your CSS selectors might look something like this for a given set of components:

```css
.success { ... }
.btn.success { .. }
.alert.success { ... }
```

Prefixed classes guide developers towards a simpler and more maintainable direction for building an extensive CSS design system. Here’s what we have if we take away the generic base class and scope things per component with prefixes:

```css
.btn-success { ... }
.alert-success { ... }
```

We use a hyphenated lowercase classname convention here at BloomBoard. Every component of .pod is accessible by a css class that is prefixed with `pod-`. Components that have a **parent-to-many-children** relationship take on a singular/plural naming scheme, as in `pod-item` and `pod-items`.

```html
  <div class="pod">
    <h3 class="pod-header">heading</h3>
    <ul class="pod-items">
      <li class="pod-item"><a class="pod-item-link" href="#">Click me</a></li>
      <li class="pod-item"><a class="pod-item-link" href="#">Click me</a></li>
    </ul>
  </div>
```

Use your best judgment here. Not everything should have a parent-to-many-children class name. Atoms used in many places will typically have a different class name.


```html
  <div class="pod">
    <h3 class="featured-heading">I'm an atom! I'm used everywhere</h3>
    <ul class="pod-items">
      <li class="pod-item">
        <img class="pod-item-image" src="im-part-of-the-molecule" />
        <a class="btn-success" href="#">I'm an atom! I'm used everywhere</a>
      </li>
      <li class="pod-item">
        <img class="pod-item-image" src="im-part-of-the-molecule" />
        <a class="btn-success" href="#">I'm an atom! I'm used everywhere</a>
      </li>
    </ul>
  </div>
```

Naming correctly for how & where it is used is just as important as the structure. 

###  Good

- `list-controls` related to list.
- `list-control-actions` child of `list-control`
- `page-navigation` describes what it does.
- `visualizations` & `visualization-pie` visualizations could go anywhere.

###  Bad 

- `white-nav` The color could change at some point.
- `topnav-actions` Position could change.
- `admin-user-result` Can only be used for user data?

Is it an atom? If yes it should be pretty generic as atoms can generally be used anywhere.

Is it a molecule? Yes, then will it be used anywhere else in the future. (The answer here should be yes). Ok then name it generically as possible while following conventions.

Need help naming? Ask a designer. They may be able to offer some help.


---

## What the...where the?

Where to put things come after you've nailed down what it is an what to call it. From here you can start coding up your sass, and figure out where to put it.

We actually mirror these design practices and methods in our folder structure. It's a great way to organize, and a constant reminder to break things down further. This is also helpful for discovery. A constant naming convention and folder structure makes it really easy to discover others mixins an variables.

```sh
|____atoms/
| |_____animations.sass
| |_____forms-elements.sass
| |_____colors.sass
| |_____reset.sass
| |_____typography.sass
| |_____buttons.sass
| |_____index.sass
|
|____molecules/
| |_____forms.sass
| |_____grid.sass
| |_____cards.sass
| |_____index.sass
| |_____nav.sass
|
|____organisms/
| |_____index.sass
| |_____search-list.sass
| |_____welcome-index.sass
|
|____utilities/
| |_____index.sass
| |_____mixins.sass
| |_____variables.sass
| |_____vendor.sass
| |____vendor/
| |____mixins/
|
|____application.sass

```


As folders get full, subfolders get created. You should always feel comfortable optimizing the subfolders, renaming and regrouping. This helps make the folder structure easy to digest and manage. Prepare for this optimization with each project and our sass structure will stay nice and clean.


#### Utilities

The utilities contain mostly non-CSS outputs (i.e. mixins, variables). The exception to that rule is vendor libraries. We keep them separate from our codebase to elevate hacks and confusion.

Best way to think about what goes in utilities is if we forked a completely new project. We would include utilities and maybe some choice atoms. Most everything else would be left. This reflects exactly what our utilities do for us.


---

## Mixins variables and others

Utilities are mostly our global helper mixins, functions, and variables. Things that are cannot be reused can remain in other sass files, but if its a helpful mixin that can be used elsewhere, or a variable we want to control across files, place it in utilities.

**Mixin examples:**

```sass
// utilities/mixins (excellent global mixin)
=multiline-text-truncate($lines: 2)
  overflow : hidden
  text-overflow: ellipsis
  display: -webkit-box
  -webkit-line-clamp: $lines
  -webkit-box-orient: vertical

// local mixin (Very specific to the molecule only)
=resource-card-cover-image
  transition: opacity .3s ease
  +background_cover
  height: 160px
  +border-top-radius(4px)
```

**Variable examples:**

```sass
// local variable
$lines-to-show: 6

// global variable (utilities/variables)
$collection-card-large-height: 325px

.my-molecule
  // local variable (might want to encapsulate in a class)
  $mobile-card-height: 175px
```


