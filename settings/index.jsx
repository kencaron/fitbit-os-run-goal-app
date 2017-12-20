import { WEB_APP } from './../companion/constants';
import { log } from './../common/util';
import { WEB_APP } from './../companion/constants.';

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function getSetting(props, key) {
  let setting = null;
  log('about to parse ' + key);
  if (props.settings[key] === undefined) return undefined;
  const setting = JSON.parse(props.settings[key]);
  log('got setting for ' + key + ': ')
  if (setting && setting.name) {
    return setting.name;
  } else if (setting && setting.color) {
    return setting.color;
  }
  return setting;
}

function link({text, href}) {
  return [
    <Link source={href}>{text}</Link>
  ];
}



function getDisplayColor(props) {
  let color = stripQuotes(props.settings.color);
  
  const displayColor = 'unset';
  
  if (color) {
    displayColor = capitalizeFirstLetter(color.slice(3));
  }
  
  return displayColor;
}


function getDisplayWebAPIStatus(props) {
  const displayStatus = 'Connect';
  const oauth = getSetting(props, 'oauth');
  if (!oauth) {
    return displayStatus;
  }
  if (oauth.access_token && oauth.refresh_token) {
    displayStatus = 'Reconnect'
  }
  return displayStatus;
}

function stripQuotes(string) {
  if (!string) return string;
  return string.replace(/['"]+/g, '');
}

const colors = [
  {color: '#5BE37D', value: 'fb-mint'},
  {color: '#F83C40', value: 'fb-red'},
  {color: '#14D3F5', value: 'fb-cyan'},
  {color: '#BCD8F8', value: 'fb-lavender'},
  {color: '#E4FA3C', value: 'fb-yellow'},
  {color: '#FFFFFF', value: 'fb-white'}
];

function setDefaults(props) {
  if (!props.settings.color) {
    props.settingsStorage.setItem('color', JSON.stringify(colors[0].value));
  }
};

function mySettings(props) {
  log('mySettings');
  setDefaults(props);
  log(JSON.stringify(props));
   
  return (
    <Page>
      <Section title="Run Goal">
        <Text>Your at-a-glance running companion.</Text>
        <Text>Change your weekly goal with the up and down buttons.</Text>
      </Section>
      <Section
        title="Activity Reporting">
        <Text>
          Connect to give Run Goal access to read your synced activities, and basic profile information. Run Goal uses your profile to determine whether your week starts on Sunday or Monday. Run Goal respects your privacy and does not share any data. 
        </Text>
        <Oauth
          settingsKey="oauth"
          title="Fitbit"
          label="Fitbit"
          status={getDisplayWebAPIStatus(props)}
          authorizeUrl="https://www.fitbit.com/oauth2/authorize"
          requestTokenUrl="https://api.fitbit.com/oauth2/token"
          clientId={WEB_APP.CLIENT_ID}
          clientSecret={WEB_APP.CLIENT_SECRET}
          scope={WEB_APP.SCOPE}
          onAccessToken={
            async (data) => {
              props.settingsStorage.setItem('tokens', JSON.stringify(data));
            }
          }
        />
      </Section>
      <Section
        title="Color">
        <ColorSelect
          centered
          settingsKey="color" 
          colors={colors}
        />
        <Text bold align="center">{getDisplayColor(props)}</Text>
      </Section>
      <Section
        title="Fitbit Profile Settings">
        <Link source="https://www.fitbit.com/user/profile/edit">
          <TextImageRow 
            label="Advanced Settings"
            icon="https://kencaron.github.io/fitbit-os-settings-assets/assets/img/fitbit-icon.svg"
          />
        </Link>
        <Text align="center">Clock Display Time, Units, Start Week On</Text>
      </Section>
      <Section
        title="Support">
        <Text>Shoot me an email with any questions via the link below.</Text>
        <Text>Some settings such as miles vs kilometers, 12/24 hour time, and preferred start day of week are based on your Fitbit Profile. Changing these settings will need a sync and an app restart for it to take effect.</Text>
        <Text>The app will attempt to renew the connection to read your activity data, but you may still need to reconnect every so often. Again, this will improve as the SDK matures and with new releases of the app.</Text>
        <Text>You will notice an exclamation icon in the bottom right corner if the connection can not be established, check your bluetooth and wifi settings on your phone and restart the app if you see this for a prolonged period of time.</Text>
      </Section>
      <Section
        title="Donate">
        <Link source="https://kencaron.github.io/fitbit-os-settings-assets/bitcoin">
          <TextImageRow 
            label="Bitcoin"
            sublabel="1H1bHPXnYaFMwsqABxSRrGvav2xtVTsztW"
            icon="https://kencaron.github.io/fitbit-os-settings-assets/assets/img/bitcoin-icon.svg"
          />
        </Link>

        <Link source="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ken.caron.dev@gmail.com&item_name=Run+Goal+Donation">
          <TextImageRow
            label="PayPal"
            sublabel="ken.caron.dev@gmail.com"
            icon="https://kencaron.github.io/fitbit-os-settings-assets/assets/img/paypal-icon.svg"
          />
        </Link>
      </Section>
      <Section
        title="Contact">
        <Link source="https://kencaron.github.io/fitbit-os-settings-assets/email">
          <TextImageRow 
            label="Email"
            sublabel="ken.caron.dev@gmail.com"
            icon="https://kencaron.github.io/fitbit-os-settings-assets/assets/img/email-icon.svg"
          />
        </Link>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);