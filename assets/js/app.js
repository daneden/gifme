//= require utils
//= require tags

// GifMe
// =====
//
// Basically a private giphy on gif.daneden.me with search
// and local/per-browser tagging.
//
// Copyright (c) 2015 Daniel Eden
// @_dte

"use strict";

(function (files) {
  // Set up our global vars
  // 'names' and 'thumbs' are almost identical, where 'thumbs' is the DOM representation of 'names'
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.js-thumb'));
  var names  = [];

  var thumbParents = Array.prototype.slice.call(document.querySelectorAll('.thumbnails__item'));
  var search       = document.querySelector('.js-search');
  var tagIndex = [];

  // Add event listeners to each thumbnail and load our search index
  thumbs.forEach(function(thumb) {
    names.push(thumb.getAttribute('data-name'));
  });

  thumbParents.forEach(function(el) {
    el.addEventListener('mouseenter', swapSource);
    el.addEventListener('mouseleave', swapSource);
    el.addEventListener('click', () => fbq('track', 'ViewContent'))
  });

  // Attach tags to the images
  files.forEach(function(item) {
    var i = names.indexOf(item.filename);
    thumbs[i].setAttribute('data-tags', item.tags);

    // Add tags to the tag index and remove duplicates
    tagIndex = tagIndex.concat(item.tags).unique();
  });

  // Add event listener to the search input
  search.addEventListener('keyup', handleSearch);
  search.addEventListener('change', handleSearch);

  // handleSearch function
  // ---------------------
  //
  // Handles the search bar update
  //
  function handleSearch(event) {
    if(event.target.value != '') {
      var query = event.target.value;
      var nameMatches = queryIndex(event, names);
      var tagMatches = queryIndex(event, tagIndex);

      tagMatches = filterFilesByTags(tagMatches);

      // Combine the arrays to show files that match by both name and tags
      var matches = nameMatches.concat(tagMatches).unique();

      // Filter the results based on our tag/name matches
      filterResultsByName(matches);
      window.history.replaceState(matches, query + " - Gifme Search", "/?s=" + query);
    } else {
      clearFilter();
      window.history.replaceState(null, "Gifme", "/");
    }

    fbq('track', 'Search')
  }

  // swapSource function
  // -------------------
  //
  // Shows animated/actual preview of image on hover.
  //
  // Arguments:
  //
  // e (event): the event triggering the function
  //
  function swapSource(e) {
    var imgParent = e.target;
    var img = imgParent.childNodes[1];
    var src = img.getAttribute('data-name');

    var imgClone;

    if(img.nextSibling.nodeName == "IMG") {
      imgClone = img.nextSibling;
    } else {
      imgClone = img.cloneNode();
      imgClone.src = './' + src;
      imgClone.classList.add('is-hidden');
      imgParent.insertBefore(imgClone, img.nextSibling);
    }

    if (e.type == 'mouseenter') {
      // We don't want to change the src of the image since doing so
      // would result in separate HTTP requests on every hover.
      //
      // Instead, add a background image to the container.
      //
      // Downside: gifs will keep looping in the background, and many
      // background-images might slow the client down.
      //

      // Hide the static/low-quality thumb
      imgClone.classList.remove('is-hidden');

    } else if (e.type == 'mouseleave') {
      // When moving away from the thumb, make it visible again
      imgClone.classList.add('is-hidden');
    }
  }

  // queryIndex function
  // --------------------
  //
  // Search/filter our names array with a case-insensitive query
  // from the search input. Returns an array of matching strings.
  //
  // Arguments:
  //
  // e     (event): the event triggering the function
  // index (array): an array of strings to check e.target.value against
  //
  function queryIndex(e, index) {
    if (index == '' || index == null) {
      index = names;
    }
    var input   = e.target;
    var val     = input.value.split(" ");
    var results = [];

    val.forEach(function(q) {
      q = new RegExp(q, "i");

      var result = index.filter(function(item){
        return q.test(item);
      });

      results.push(result);
    });

    // Flatten the results arrays
    var flattened = [];
    results.forEach(function(current) {
      current.forEach(function(r) {
        flattened.push(r);
      });
    });

    // De-dupe the flattened array
    results = flattened.unique();

    // Return the array
    return results;
  }

  // filterResultsByName function
  // ----------------------
  //
  // Filter and hide image thumbnails based on results from the
  // queryIndex function
  //
  // Arguments:
  //
  // results (array): a subset of our names variable
  //
  function filterResultsByName(results) {
    // Initially hide all thumbnail parents
    thumbParents.forEach(function(el) {
      el.classList.add('is-hidden');
    });

    // Filter matching results and unhide the parents
    results.forEach(function(result) {
      var pos = names.indexOf(result);

      if (pos >= 0) {
        thumbParents[pos].classList.remove('is-hidden');
      }
    });
  }

  // filterFilesByTags function
  // ----------------------
  //
  // Filter and hide image thumbnails based on results from the
  // queryIndex function. Returns an array of files with matching
  // tags.
  //
  // Arguments:
  //
  // results (array): a subset of our tags variable
  //
  function filterFilesByTags(results) {
    var filteredResults = [];

    results.forEach(function(result, i) {
      files.forEach(function(thumb, i) {
        var file = thumb.filename;
        var tags = thumb.tags;

        tags.forEach(function(tag) {
          if(result == tag) filteredResults.push(file);
        });
      });
    });

    return filteredResults.unique();
  }

  // clearFilter function
  // --------------------
  //
  // Clears all filters on the results
  //
  function clearFilter() {
    thumbParents.forEach(function(el) {
      el.classList.remove('is-hidden');
    });
  }

  // Check if there's a query sent via URL query string
  function prepSearch() {
    var query = window.location.search;

    if (query.indexOf('?s=') == 0) {
      query = query.replace('?s=', '');
      search.value = query;
      if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        search.dispatchEvent(evt);
      } else {
        search.fireEvent("onchange");
      }
    } else {
      return
    }
  }

  document.addEventListener("DOMContentLoaded", prepSearch(), false);
}(gifmeFiles));
