<!DOCTYPE html>
<html lang="en">
  <head>
	<title>Genesis.VirtualCloud.IO - VirtualCloud Login</title>
	
	<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="favicon.png">

    <link href="lib/semantic-ui-css/semantic.min.css" rel="stylesheet">

	  <link href="style.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>
  <body class="site">

    <h3 class="ui center aligned icon header">
  
      <div class="ui grid">

        <div class="three column row">

          <div class="left floated center aligned three wide column -status-segment">

              <h5 class="ui header">Current <span class="label">status</span></h5>
              <p>Workflow stabilized system</p>
              <h5 class="ui header"><span class="label">status</span> Goal</h5>
              <p>Test stabilized system</p>

          </div>

          <div class="center floated ten wide center aligned column">

              You are (re-)joining a <div class="ui violet label">PRIVATE</div><br/>
              <a href="http://Genesis.VirtualCloud.IO">Genesis.VirtualCloud.IO</a> <div class="ui label">Space</div><br/>
              using <a href="http://opensource.org/">Open Source</a> Technology

          </div>

          <div class="right floated center aligned three wide column -status-segment">

            <h5 class="ui header"><a href="http://Genesis.VirtualCloud.IO">genesis.virtualcloud.io</a><br/>Continuous BETA</h5>
            <p>Ready for early exploration and experimentation by proficients</p>

          </div>

        </div> 

      </div> 

    </h3>

    <div class="field">    
      {% if authorized.github %}

        <div class="ui green message">

          <div class="ui grid">

            <div class="three column row">

              <div class="left floated center aligned three wide column">
                <i class="ui huge unlock icon"></i>
              </div>

              <div class="center floated ten wide center aligned column -root-namespace-banner">
                <h4 class="ui header">Stable Virtual Cloud Root Namespace:</h4>
                <h2 class="ui green header">{{vct.arrived.namespaceUri}}</h2>
              </div>

              <div class="right floated center aligned three wide column">
                <i class="ui huge unlock icon"></i>
              </div>
  
            </div> 

          </div> 

        </div>

      {% else %}

        <div class="ui red message">

          <div class="ui grid">

            <div class="three column row">

              <div class="left floated center aligned three wide column">
                <i class="ui huge lock icon"></i>
              </div>

              <div class="center floated ten wide center aligned column">
                <h4 class="ui header">Stable Virtual Cloud Root Namespace:</h4>
                <h2 class="ui red header">{{vct.arrived.namespaceUri}}</h2>
              </div>

              <div class="right floated center aligned three wide column">
                <i class="ui huge lock icon"></i>
              </div>
  
            </div>

          </div>

        </div>

      {% endif %}
    </div>

    <div class="ui hidden divider"></div>

    {% if vct %}

    <div class="ui two column centered grid">

      <!-- #1: Form  #2: User List -->

      <div class="eight wide column">

        <h2 class="ui header">Anchorment</h2>
        <p>This <b>Space</b> is <a href="https://en.wiktionary.org/wiki/anchor">anchored</a> with complete internal governmental transparency by:</p>

        <div class="ui grid">

          <div class="column">


            <form class="ui form">
              <h4 class="ui dividing header">Source Code (Technology)</h4>
              <div class="field">    
                <div class="two fields">
                  <div class="field">
                    <label>Repository (Idea)</label>
                    <input value="{{vct.requested.repository}}" readonly="readonly" type="text">
                  </div>
                  <div class="field">
                    <label>Branch (Iteration)</label>
                    <input value="{{vct.requested.branch}}" readonly="readonly" type="text">
                  </div>
                </div>
              </div>
              <h4 class="ui dividing header">Virtual Model Cloud (Imagination)</h4>
              <div class="field">
                <div class="two fields">
                  <div class="field">
                    <label>Root Secret Proof (Unlock Key Posession)</label>
                    <input value="{{vct.requested.rootSecretHash}}" readonly="readonly" type="text">
                  </div>
                  <div class="field">
                    <label>Public Key Fingerprint (Unique Identifier)</label>
                    <input value="{{vct.requested.publicKeyFingerprint}}" readonly="readonly" type="text">
                  </div>
                </div>
              </div>


              <h2 class="ui header">Animation (Manifestation)</h2>
              <p>This <b>Space</b> is <a href="https://en.wiktionary.org/wiki/animated">animated</a> <b>for you by reacting to events</b> generated by authenticated services tied to your identity:</p>


              {% if authorized.github %}
              <h4 class="ui dividing header">Your <i>current temporary session</i> to this Virtual Cloud Space</h4>
              <div class="field">
                <div class="two fields">
                  <div class="field">
                    <label>Access Secret Proof (Session Key Posession)</label>
                    <input value="{{vct.arrived.accessSecretHash}}" readonly="readonly" type="text">
                  </div>
                  <div class="field">
                    <label>Session</label>
                    <div link-to="logout" class="ui button">
                      Inspect
                    </div>
                    <div link-to="logout" class="ui button">
                      Rotate
                    </div>
                    <div link-to="logout" class="ui button">
                      Destroy
                    </div>
                  </div>
                </div>
              </div>
              {% endif %}

            </form>

          </div>

        </div>

        <div class="ui grid">

          <div class="sixteen wide column">

      {% else %}

      <div class="ui hidden divider"></div>

      <div class="ui center aligned grid">

        <div class="ten wide column">


      {% endif %}

