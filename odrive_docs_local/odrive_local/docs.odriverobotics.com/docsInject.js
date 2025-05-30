
class ApiClient {
    constructor(key) {
        this.key = key;
    }
    
    callRaw(method, url, args) {
        if (method == 'GET' && args != undefined) {
          const argStrs = [];
          for(var p in args)
             argStrs.push(encodeURIComponent(p) + "=" + encodeURIComponent(JSON.stringify(args[p])));
          const str = argStrs.join("&");
          url += '?' + str;
          args = undefined;
        }

        return new Promise((resolve, reject) => {
          try {
            const http = new XMLHttpRequest();
            http.responseType = "blob";
            http.open(method, 'https://api.odriverobotics.com/' + url, true);
            if (this.key)
                http.setRequestHeader( 'authorization', this.key );
            if (method != 'GET' && args != undefined) {
                http.send(JSON.stringify(args));
            } else {
                http.send();
            }
            http.onreadystatechange = (e) => {
                if (http.readyState == 4) {
                    if (http.status == 200) {
                        resolve(http.response);
                    } else {
                        reject("failed");
                    }
                }
            }
            console.log("sent ", args);
          } catch (ex) {
            reject(ex);
          }
        });
    }
    async call(method, url, args) {
      const text = await (await this.callRaw(method, url, args)).text();
      return JSON.parse(text);
    }
}


function uiBuildBanner(children, backround, url=null, newTab=false) {
    const elem = document.createElement('header');
    elem.style.maxWidth = '800px';
    elem.style.padding = '4px';
    elem.style.textAlign = 'center';
    elem.style.fontWeight = 'bold';
    elem.style.background = backround;
    elem.style.color = 'white';

    var container;
    if (url) {
        container = document.createElement('a');
        container.style.display = 'block';
        container.style.color = 'white';
        container.href = url;
        if (newTab) container.target = "_blank";
        elem.appendChild(container);
    } else {
        container = elem;
    }

    for (c of children) {
        container.appendChild(c);
    }

    return elem;
}

function uiBuildRtdFooterSection(title, children) {
    const dl = document.createElement('dl');

    const dt = document.createElement('dt');
    dt.appendChild(document.createTextNode(title));
    dl.appendChild(dt);

    for (c of children) {
        const dd = document.createElement('dd');
        if (c.highlight) dd.style.fontWeight = 'bold';
        const a = document.createElement('a');
        a.appendChild(document.createTextNode(c.name));
        a.href = c.url;
        dd.appendChild(a);
        dl.appendChild(dd);
    }

    return dl;
}

function addOnTop(children) {
    for (c of children.reverse()) {
        document.getElementsByClassName('wy-nav-content-wrap')[0].prepend(c);
    }
}

window.onload = async function() {
    const api = new ApiClient();
    const releaseIndex = await api.call('GET', 'releases/docs/index');

    const masterChannelInfo = releaseIndex.channels.filter(c => c.channel == 'master')[0];
    const additionalChannels = ['devel'];

    const selectableVersions = [
        ...[...masterChannelInfo.commits].reverse(),
        ...additionalChannels
    ];

    let thisVersion = DOCUMENTATION_OPTIONS.VERSION;
    const latestVersion = [...masterChannelInfo.commits].splice(-1)[0];

    const banners = [];

    const versionInUrl = (new RegExp("/v/([^/]*)")).exec(window.location.pathname);
    if (versionInUrl && (versionInUrl[1] != 'latest')) {
        thisVersion = versionInUrl[1];
    }

    if (!thisVersion.startsWith('0.5.')) {
        banners.push(uiBuildBanner([
            document.createTextNode("This documentation is for current-generation ODrives. For ODrive v3.6 see here.")
        ], backgound='rgb(24 118 141)', url='https://docs.odriverobotics.com/v/0.5.6/'));
    }

    if (thisVersion == latestVersion || additionalChannels.includes(thisVersion)) {
        banners.push(uiBuildBanner([
            document.createTextNode("Click here to try our web GUI!")
        ], background='rgb(24 141 72)', url='https://gui.odriverobotics.com/', newTab=true));

    }

    if (thisVersion != latestVersion) {
        banners.push(uiBuildBanner([
            document.createTextNode("You're looking at " + ((thisVersion == "devel") ? "the development version" : "an old version") + " of the documentation."),
            document.createElement('br'),
            document.createTextNode("Click here to see the latest " + ((thisVersion == "devel") ? "production version" : "version") + ".")
        ], backgound='#274887', url='https://docs.odriverobotics.com/v/latest/'));
    }

    addOnTop(banners);

    // Create version selector. The corresponding styling is already built into
    // the read-the-docs theme, we just need to generate the corresponding HTML
    // elements.

    const divVersions = document.createElement('div');
    divVersions.classList = 'rst-versions';
    divVersions.setAttribute('data-toggle', 'rst-versions');
    divVersions.role = 'note';
    divVersions.ariaLabel = 'versions';

    const spanCurrentVersion = document.createElement('span');
    spanCurrentVersion.classList = 'rst-current-version';
    spanCurrentVersion.setAttribute('data-toggle', 'rst-current-version');

    const span1 = document.createElement('span');
    span1.classList = 'fa fa-book';
    span1.appendChild(document.createTextNode(" Firmware Version"));
    spanCurrentVersion.appendChild(span1);

    spanCurrentVersion.appendChild(document.createTextNode(
        " v: " + thisVersion + (thisVersion == latestVersion ? ' (latest)' : '') + " "
    ));

    const span2 = document.createElement('span');
    span2.classList = 'fa fa-caret-down';
    spanCurrentVersion.appendChild(span2);

    divVersions.appendChild(spanCurrentVersion);
    
    const divOtherVersions = document.createElement('div');
    divOtherVersions.classList = 'rst-other-versions';

    divOtherVersions.appendChild(uiBuildRtdFooterSection('Versions',
        selectableVersions.map((v) => { return {
            name: v + (v == latestVersion ? ' (latest)' : ''),
            url: 'https://docs.odriverobotics.com/v/' + (v == latestVersion ? 'latest' : v) + '/',
            highlight: v == thisVersion
        };})
    ))

    divOtherVersions.appendChild(uiBuildRtdFooterSection('ODrive', [
        {name: 'Homepage', url: 'https://www.odriverobotics.com/'},
        {name: 'GUI', url: 'https://gui.odriverobotics.com/'},
        {name: 'Shop', url: 'https://www.odriverobotics.com/shop'},
        {name: 'Forum', url: 'https://discourse.odriverobotics.com/'},
    ]))
    
    divVersions.appendChild(divOtherVersions);

    document.body.appendChild(divVersions);
}
