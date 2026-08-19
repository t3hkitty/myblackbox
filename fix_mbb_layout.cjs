const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(
  "import { dispatchCustomWebhook } from './services/customWebhookService';",
  "import { dispatchCustomWebhook } from './services/customWebhookService';\nimport { DualPaneWorkspace } from '@lorik/shared-kawaii-ui';"
);

// We need to wrap the two columns in DualPaneWorkspace

// Find Left Column
const leftStart = "{/* Left Column */}\n        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>";
// Find Right Column
const rightStart = "{/* Right Column */}\n        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>";

const newLeftStart = `<DualPaneWorkspace 
          leftTitle="Dashboard & Tasks"
          leftIcon={<span style={{ fontSize: '1.2rem' }}>⚡</span>}
          rightTitle="Trackers & Feeds"
          rightIcon={<span style={{ fontSize: '1.2rem' }}>📡</span>}
          leftContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>`;

const newRightStart = `</div>
          }
          rightContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>`;

content = content.replace(leftStart, newLeftStart);
content = content.replace(rightStart, newRightStart);

// At the end of the <main>, close the DualPaneWorkspace
const mainEnd = `        </div>

      </main>`;

const newMainEnd = `        </div>
          }
        />
      </main>`;

content = content.replace(mainEnd, newMainEnd);

// Change main style
const oldMainStyle = `<main style={{ padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>`;
const newMainStyle = `<main style={{ padding: '0 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>`;
content = content.replace(oldMainStyle, newMainStyle);

// Remove Corkboard
const corkboardRegex = /\{\/\* Corkboard Panel \(Fits Up To 4 Pinned Panels\) \*\/\}[\s\S]*?(?=<DualPaneWorkspace)/;
content = content.replace(corkboardRegex, '');

fs.writeFileSync('src/App.jsx', content);
console.log("Done");
