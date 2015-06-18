VirtualCloud for PIO.Profile
============================

A component to connect [io.pinf.pio.profile](https://github.com/pinf-io/io.pinf.pio.profile) to a *Virtual Cloud of Information* residing on one or more storage backends.

The following storage backends are supported:

  * [AWS S3](http://aws.amazon.com/s3/)

Requirements:

  * [Github](https://github.com) account
  * [AWS](http://aws.amazon.com/) account


What the component does
-----------------------

Given:

  * Github repository uri
  * Private RSA key
  * Root Secret
  * Github api credentials
  * AWS S3 api credentials, bucket and paths

It will:

  1. Launch a server on localhost with Github integration configured
  2. Promt user to log in
  3. Verify that the user has access to the repository
  4. Derive a *root namespace uri* for the repository
  5. Derive an *access secret* for the *root namespace uri*
  6. Encrypt *access structure* using *Root Secret*
  7. Encode encrypted *access structure* as a [JSON Web Token](http://jwt.io/) decryptable using the *public portion* of the *private RSA key*.
  8. Provide one-time use, short lifespan invitation links with passcodes to send to other people to join the cloud.


What the component provides
---------------------------

A [JSON Web Token](http://jwt.io/) containing everything needed to treat provided paths as non-conflicting global storage uris. This token can be passed along with the *public RSA key* to any service that needs access to the root config files for the virtual cloud of information. In practice this will be the services that manage the information space and hand out lesser priviledged access to other services.

So from a security perspective the:

  * **Private RSA key** can *stay secure* and is needed only once to generate the JSON Web Token which can be *shared publickly* 
  * **Public RSA key** is *shared publickly* and used to establish the identity of a JSON Web Token by enabeling its decoding
  * **Root Secret** is *shared privately* and used to decrypt the *access structure*.

This provides a place to store files that are accessible using a uri & sensitive secret and is the most foundational level of all data clouds. You can now invent all kinds of fancy ways to transfer this secret to others and build sub-authorization spaces within this root space that uses expiring secrets.


What the component does NOT provide
-----------------------------------

  * A way to track who has access to the data cloud. This must be provided by the storage backend or a layer around this component.

