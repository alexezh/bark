var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();

var app = builder.Build();

//app.MapGet("/", () => "Hello World!");
WorldCollection.Instance.Initialize();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
  // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
  app.UseHsts();
}

//app.UseHttpsRedirection();
var staticOptions = new StaticFileOptions();
staticOptions.ServeUnknownFileTypes = true;
app.UseStaticFiles(staticOptions);
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=World}/{action=Get}/{id?}");

app.MapControllerRoute(
    name: "world",
    pattern: "/api/{controller=World}/{action=Get}/{id?}");

app.MapControllerRoute(
    name: "atlas",
    pattern: "/api/{controller=Resource}/{action=GetAtlases}/{id?}");

app.MapControllerRoute(
    name: "tiles",
    pattern: "/api/{controller=Resource}/{action=GetTiles}/{id?}");

app.MapControllerRoute(
    name: "addCompositeTile",
    pattern: "/api/{controller=Resource}/{action=AddCompositeTile}/{id?}");

app.MapControllerRoute(
    name: "updateTile",
    pattern: "/api/{controller=Resource}/{action=UpdateTile}/{id?}");

app.MapControllerRoute(
    name: "map",
    pattern: "/api/{controller=World}/{action=GetMap}/{id?}");

app.MapControllerRoute(
    name: "map2",
    pattern: "/api/{controller=World}/{action=UpdateTileLayer}/{id?}");

app.MapControllerRoute(
    name: "map3",
    pattern: "/api/{controller=World}/{action=AddTileBuffer}/{id?}");

app.MapControllerRoute(
    name: "map4",
    pattern: "/api/{controller=World}/{action=AddTileSet}/{id?}");

app.MapControllerRoute(
    name: "spawnPokemon",
    pattern: "/api/{controller=World}/{action=SpawnPokemon}/{id?}");

app.MapControllerRoute(
    name: "spawnCharacter",
    pattern: "/api/{controller=World}/{action=SpawnCharacter}/{id?}");

app.MapControllerRoute(
    name: "updateAvatarRuntimeProps",
    pattern: "/api/{controller=World}/{action=UpdateAvatarRuntimeProps}/{id?}");

app.MapControllerRoute(
    name: "updateMapCode",
    pattern: "/api/{controller=World}/{action=UpdateMapCode}/{id?}");

app.MapControllerRoute(
    name: "getCodeLibrary",
    pattern: "/api/{controller=Resource}/{action=FetchFiles}/{id?}");

app.MapControllerRoute(
    name: "updateCode",
    pattern: "/api/{controller=Resource}/{action=StoreFile}/{id?}");

//app.MapFallbackToFile("index.html"); ;
app.MapHub<RctHub>("/updates");

app.Run();
