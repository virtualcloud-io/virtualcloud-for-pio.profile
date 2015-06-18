<!DOCTYPE html>
<html lang="en">
  <head>
	<title>Genesis.VirtualCloud.IO - VirtualCloud Login</title>
	
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="/favicon.png">

    <link href="/lib/semantic-ui-css/semantic.min.css" rel="stylesheet">

	  <link href="/style.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>
  <body class="site">

    <div class="ui hidden divider"></div>

    <h2 class="ui center aligned icon header">
      <i class="circular cloud icon"></i>
      <a href="http://Genesis.VirtualCloud.IO">Genesis.VirtualCloud.IO</a> login for:
    </h2>

    {% if vct %}

    <div class="ui hidden divider"></div>

    <div class="ui two column centered grid">

      <div class="column">

        <div class="ui basic segment">

          <div class="ui attached form">

            <div class="two fields">
              <div class="ten wide field">
                <label>Repository</label>
                <input value="{{vct.requested.repository}}" readonly="readonly" type="text">
              </div>
              <div class="six wide field">
                <label>Branch</label>
                <input value="{{vct.requested.branch}}" readonly="readonly" type="text">
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>


    <div class="ui two column centered grid">

      <div class="column">

        <h2 class="ui header">VirtualCloud Namespace:</h2>

        <div class="ui blue message">
          <h3 class="ui center aligned header">{{vct.arrived.namespaceUri}}</h3>
        </div>

      </div>

    </div>


    <div class="ui hidden divider"></div>

    <div class="ui two column centered grid">

      <div class="four column centered row">
        <div class="column">

          <h5 class="ui top attached disabled header">
            Credentials
          </h5>

          <div class="ui attached form disabled segment">

            <div class="field">
              <label>Root Secret Hash</label>
              <input value="{{vct.requested.rootSecretHash}}" readonly="readonly" type="text">
            </div>
            <div class="field">
              <label>Public Key Fingerprint</label>
              <input value="{{vct.requested.publicKeyFingerprint}}" readonly="readonly" type="text">
            </div>

          </div>

        </div>
        <div class="column">

    {% else %}

    <div class="ui hidden divider"></div>

    <div class="ui two column centered grid">

      <div class="column">


    {% endif %}
