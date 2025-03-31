# Jason's Blog

Welcome to My Blog! This is a simple and powerful Middleman application that does amazing things.

## Getting started

To get started with my blog, follow these steps:

1. Clone this repository to your local machine.
  ```sh
  git clone https://github.com/jasoncypret/jasonblog.git
  ```

2. Navigate to the project directory.
  ```sh
  cd jasonblog
  ```

3. This site runs on asdf. Make sure you have that installed with ruby and run:
  ```sh
  asdf install
  ```

4. Once run you can bundle like normal.
  ```sh
  bundle install
  ```

## Run the site

1. Run the Middleman server
  ```sh
  bundle exec middleman server
  ```

2. Open your web browser and visit `http://localhost:4567` to see the app in action. Visit `http://localhost:4567/__middleman` to see the config settings.

## Write a New Post

```sh
bundle exec middleman article "Launching my blog"
```

## Test Build before Publishing to GitHub Pages

```sh
bundle exec rake build # Compile all files into the build directory
```


## Publish to GitHub Pages

Clear/delete build folder before this step

```sh
rm -rf build/ && bundle exec rake publish ALLOW_DIRTY=true # Build and publish to Github Pages
```


## Configuration

You can configure My Blog by modifying the `config.rb` file in the project root directory. Make sure to update the necessary settings before running the application.

This is a [good starter template](https://github.com/middleman/middleman-templates-blog) to study.
