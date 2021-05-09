
$('#room-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  

  $.ajax(
    {type:'GET',
    url:'/rooms?' + search,
    contentType:'application/json',
    success:function(data) {
      $('#room-grid').html('');
      if(data.length === 0){
        $('#room-grid').append(`
          <div class="col p-0 m-0">
            <h5>Sorry! No Such Room Found.</h5>
          </div>
        `);
      }
      data.forEach(function(room) {
        $('#room-grid').append(`
        <div class="card m-3" style="width: 18rem; max-height: 54rem">
        <img src="${ room.image }" class="card-img-top" alt="...">
        <div class="card-body p-1">
          <h5 class="card-title">${ room.name }</h5>
          <p class="card-text"> ${room.cost} Rs./day</p>
          <span class="text-capitalize text-muted">${ room.location }</span>
          <p><a href="/rooms/${ room._id }" class="btn btn-primary">More Info</a></p>
        </div>
      </div>
        `);
      });
    }});


  
});

$('#room-search').submit(function(event) {
  event.preventDefault();
});