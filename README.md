# Clubs OAuth

Wrapper around hack club clubs api (would've been better if I could have just used airtable), this project's purpose is to make it significantly easier to add club member sign in to projects because let's be real just about everything supports oauth2 and oidc

## Features required

- [ ] Improve the chaos known as auth, particularly with hca
- [ ] Add the club_name and club_role claims to the oauth server

## Development

I may have been a bit too lazy to make a mock api, this project can only really be worked on if you have a clubs api key, I may make one so that ysws reviewers can check it

If you have what's required you just need to set up .env (copied from .env.example), sveltekit will tell you if something's missing, then running it is just

```sh
bun i
bun run dev
```

## Production

This is honestly not far off of being production ready but that's just because the oauth server is really the only complex part here
