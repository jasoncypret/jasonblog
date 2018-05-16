# Serve

```shell
$ middleman
```

# Write New Post

```shell
$ bundle exec middleman article "Launching my blog"
```


# Publish

[Github Pages Middleman config](https://github.com/neo/middleman-gh-pages)

```ruby
rake build    # Compile all files into the build directory
rake publish  # Build and publish to Github Pages
```

If you get an error similar to:

```sh
error: src refspec gh-pages does not match any.
error: failed to push some refs to...
```

Then delete the build directory and try again. You may need `bundle exec rake publish ALLOW_DIRTY=true`
