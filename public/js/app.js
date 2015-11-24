// GifMe
// =====
//
// Basically a private giphy on gif.daneden.me with search
// and local/per-browser tagging.
//
// Copyright (c) 2015 Daniel Eden
// @_dte

(function(){
  // Set up our global vars
  var thumbs       = document.querySelectorAll('.js-thumb');
  var thumbParents = document.querySelectorAll('.thumbnails__item');
  var search       = document.querySelectorAll('.js-search')[0];
  var names = [];

  // Add event listeners to each thumbnail and load our search index
  for (var i = 0; i < thumbs.length; i++) {
    var thumb = thumbs[i];

    thumb.addEventListener('mouseover', swapSource);
    thumb.addEventListener('mouseout', swapSource);

    names.push(thumb.getAttribute('data-name'));
  }

  // Add event listener to the search input
  search.addEventListener('keyup', searchNames);

  // swapSource function
  // -------------------
  //
  // Shows animated/actual preview of image on hover
  //
  function swapSource(e) {
    var img = e.target;
    var src = img.getAttribute('data-name');
    var imgParent = img.parentNode;

    if (e.type == 'mouseover') {
      // We don't want to change the src of the image since doing so
      // would result in separate HTTP requests on every hover.
      //
      // Instead, add a background image to the container.
      //
      // Downside: gifs will keep looping in the background, and many
      // background-images might slow the client down.
      //
      imgParent.style.backgroundImage = 'url("./gifs/' + src + '")';

      // Hide the static/low-quality thumb
      img.classList.add('is-hidden');

    } else if (e.type == 'mouseout') {
      // When moving away from the thumb, make it visible again
      img.classList.remove('is-hidden');
    }
  }

  // searchNames function
  // --------------------
  //
  // Search/filter our names array with a case-insensitive query
  // from the search input
  //
  function searchNames(e) {
    var input = e.target;
    var val   = input.value;
    var q     = new RegExp(val, "i");

    var results = names.filter(function(item){
      return q.test(item);
    })

    // Pass our filtered array to the filterResults function
    filterResults(results);
  }

  // filterResults function
  // ----------------------
  //
  // Filter and hide image thumbnails based on results from the
  // searchNames function
  function filterResults(results) {
    // Initially hide all thumbnail parents
    for (var i = 0; i < thumbParents.length; i++) {
      thumbParents[i].classList.add('is-hidden');
    }

    // Filter matching results and unhide the parents
    for (var i = 0; i < results.length; i++) {
      var pos = names.indexOf(results[i]);

      if (pos >= 0) {
        thumbParents[pos].classList.remove('is-hidden');
      }
    }
  }
})();
