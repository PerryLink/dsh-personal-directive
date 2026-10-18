# dsh-personal-directive

> Release stamp: `0.2.9` (2026-10-04).

> ⚠️ यह प्रोजेक्ट DSH इकोसिस्टम से हटा दिया गया है और अब किसी भी कैटलॉग सूची में भाग नहीं लेता (2026-09-13)।

- **1024 स्टोर चैनल**: एक बार `npm i -g dsh1024` चलाएँ, फिर `dsh1024 plugin --profile web add dsh-personal-directive` (यह [deepseek1024.com](https://deepseek1024.com) की इंस्टॉल रैंकिंग में गिना जाता है)।

DeepSeek Harness के लिए «Infinite Generation One» के फोर्क का **फ्रेमवर्क संस्करण**: यह मूल रिपॉज़िटरी का प्लगइन स्वरूप बनाए रखता है (सिस्टम प्रॉम्प्ट इंजेक्शन + टूल + ऊपर रनटाइम स्विच), पर **मूल प्रॉम्प्ट की सामग्री पैकेज के साथ वितरित नहीं करता** — उसकी जगह एक तटस्थ प्लेसहोल्डर निर्देश भेजा जाता है, जिसे आप अपने व्यक्तिगत निर्देशों से बदल सकते हैं।

> यह प्रोजेक्ट मूल प्रोजेक्ट पर आधारित एक व्यक्तिगत संस्करण है, मूल लेखक की आधिकारिक रिलीज़ नहीं।

## इंस्टॉल

### GitHub से इंस्टॉल

सीधे GitHub से इंस्टॉल करना सुझाया जाता है:

```powershell
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

अगर `dsh` PATH में नहीं है, तो DSH इंस्टॉल निर्देशिका का कमांड इस्तेमाल करें:

```powershell
& "D:/deepseek-harness/node_modules/.bin/dsh.cmd" plugin --profile web add github:PerryLink/dsh-personal-directive
```

इंस्टॉल सफल होने पर DSH स्वतः यह करता है:

1. प्लगइन को `~/.dsh/profiles/web/package.json` की `dependencies` में जोड़ता है।
2. `dsh-personal-directive` को `dsh.profile.bundles` में जोड़ता है।
3. प्लगइन के साथ आने वाला `cordis.patch.yml` लागू करता है।
4. प्लगइन की सर्वर-साइड और Web क्लाइंट निर्भरताएँ इंस्टॉल करता है।

इसके बाद `dsh web` को पूरी तरह पुनः आरंभ करें और पेज रीफ़्रेश करें:

```text
http://127.0.0.1:3080
```

### स्थानीय इंस्टॉल विकल्प (git / pack)

विकास, स्रोत बदलने या स्थानीय बैकअप से बहाली के लिए उपयुक्त। git इंस्टॉल निर्भरताएँ भी इंस्टॉल करता है:

```powershell
dsh plugin --profile <p> add github:PerryLink/dsh-personal-directive
```

`<p>` की जगह लक्षित प्रोफ़ाइल का नाम रखें (जैसे `web`)।

पहले पैक करके स्थानीय tarball से भी इंस्टॉल कर सकते हैं:

```powershell
npm pack
dsh plugin --profile <p> add ./dsh-personal-directive-0.2.0.tgz
```

पैक-इंस्टॉल भी निर्भरताएँ इंस्टॉल करता है। स्रोत बदलने के बाद दोबारा पैक, दोबारा इंस्टॉल और `dsh web` का पुनः आरंभ ज़रूरी है, तभी नया Host या Web क्लाइंट कोड लोड होगा।

### स्थानीय लिंक से GitHub संस्करण पर जाना

अगर प्रोफ़ाइल में उसी नाम का स्थानीय लिंक पहले से है, तो पहले पुरानी निर्भरता हटाएँ:

```powershell
dsh plugin --profile web remove dsh-personal-directive
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

### अपडेट

GitHub से इंस्टॉल करने के बाद नवीनतम संस्करण पर अपडेट:

```powershell
dsh plugin --profile web update dsh-personal-directive
```

अपडेट के बाद `dsh web` को पूरी तरह पुनः आरंभ करें।

### अनइंस्टॉल

अनइंस्टॉल केवल प्लगइन हटाता है, उपयोगकर्ता के अन्य बंडल नहीं हटाता:

```powershell
dsh plugin --profile web remove dsh-personal-directive
```

ऊपर का «निर्देश: चालू / निर्देश: बंद» रनटाइम स्विच है, ऊपर दिए अनइंस्टॉल कमांड के बराबर नहीं।

## अनुकूलता

| पहलू | स्थिति |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1` (`0.2.1-alpha.1` लाइन पर पिन: devDependencies में `@deepseek-ai/dsh-typert-registry` और dependencies में `@deepseek-ai/dsh-typert-protocol`; `pnpm run harness:check` और `pnpm test` गेट द्वारा नियंत्रित; peer रेंज `>=0.2.1-0 <0.3.0` भी स्वीकार करती है) |

## प्रोजेक्ट का स्रोत

मूल प्रोजेक्ट:

- GitHub: https://github.com/Minglink/dsh-infinite-gen-1
- नाम: dsh-infinite-gen-1 / 无限一代 (Infinite Generation One)
- मूल लेखक: Minglink

यह फ्रेमवर्क संस्करण मूल प्लगइन संरचना (प्रॉम्प्ट अनुच्छेद इंजेक्शन, `personal_directive_profile` टूल, Web के ऊपर स्विच) बनाए रखता है, उसके ऊपर Web के ऊपर दृश्य नियंत्रण जोड़ता है, और प्रॉम्प्ट की सामग्री को तटस्थ प्लेसहोल्डर निर्देश से बदल देता है (देखें «श्रेय और लाइसेंस»)।

## इस संस्करण में क्या जोड़ा गया

मूल रिपॉज़िटरी की तुलना में यह प्रोजेक्ट मुख्य रूप से यह जोड़ता है:

- DeepSeek Harness Web के ऊपर «निर्देश: चालू / निर्देश: बंद» बटन «पूर्णता संकेत» के बाद रजिस्टर करता है।
- प्रॉम्प्ट की स्थिति रनटाइम रिमोट इंटरफ़ेस से बदलता है, प्लगइन हटाकर नहीं।
- प्लगइन इंस्टॉल और लोड रहता है; बंद करने पर केवल इस व्यक्तिगत निर्देश का सिस्टम प्रॉम्प्ट अनुच्छेद खाली सामग्री लौटाता है।
- चालू या बंद करने का असर केवल आगे के मॉडल अनुरोधों पर पड़ता है; पहले भेजे गए अनुरोध नहीं बदलते।
- मूल `personal_directive_profile` टूल का स्वरूप बनाए रखता है (मूल में इसका नाम `infinite_gen1_profile` था)।
- निर्भरताएँ npm रजिस्ट्री से आती हैं (स्थानीय विकास में आप स्रोत बदलकर दोबारा पैक और इंस्टॉल कर सकते हैं)।

स्विच की जगह DSH UI स्लॉट तय करता है:

```text
conversation.session.header.actions
```

यह प्रोजेक्ट क्रम `1010` इस्तेमाल करता है ताकि यह मौजूदा «पूर्णता संकेत» बटन के बाद रहे।

## निर्देशिका संरचना

```text
dsh-personal-directive/
├── index.js                         # Harness सर्वर-साइड प्लगइन प्रवेश और रनटाइम स्विच
├── lib/
│   └── client.js                    # ऊपर का दृश्य स्विच
├── scripts/
│   ├── check-client-contract.mjs    # होस्ट कॉन्ट्रैक्ट जाँच (सिंबल मौजूदगी गेट)
│   ├── check-typert-codec.mjs       # Typert कोडेक गेट (एकमात्र फलक: create())
│   ├── probe-typert-codec-contract.mjs  # इंस्टॉल किए गए होस्ट पर कोडेक कॉन्ट्रैक्ट मापता है
│   └── lib/                         # गेट के साझा पार्स/स्रोत/पुनर्लेखन हेल्पर
├── prompts/
│   └── personal-directive.md        # तटस्थ प्लेसहोल्डर निर्देश (आप अपनी सामग्री रख सकते हैं)
├── cordis.patch.yml                 # बंडल इन्सर्ट घोषणा
├── package.json                     # Harness बंडल/क्लाइंट मेटाडेटा
├── pnpm-lock.yaml                   # स्थानीय निर्भरता लॉक फ़ाइल
└── README.md
```

## पर्यावरण आवश्यकताएँ

- DeepSeek Harness इंस्टॉल हो और `dsh web` ठीक से शुरू होता हो।
- `dsh plugin` कमांड उपलब्ध हो।
- `pnpm` PATH में हो।
- यह इंस्टॉल ट्यूटोरियल `web` प्रोफ़ाइल के लिए है।

## स्विच का उपयोग

पुनः आरंभ के बाद ऊपर देखें:

```text
完成提示    指令：开启
```

क्लिक करने पर बदल जाता है:

```text
完成提示    指令：关闭
```

यह स्विच केवल यह नियंत्रित करता है कि रनटाइम प्रॉम्प्ट लागू होता है या नहीं:

- चालू: अगले मॉडल अनुरोध में `prompts/personal-directive.md` का व्यक्तिगत निर्देश शामिल होता है।
- बंद: प्लगइन इंस्टॉल रहता है, पर इस प्रोजेक्ट का सिस्टम प्रॉम्प्ट अनुच्छेद खाली रहता है।
- प्लगइन को प्रोफ़ाइल की `dependencies` से नहीं हटाता।
- प्लगइन को `dsh.profile.bundles` से नहीं हटाता।
- व्यक्तिगत प्लगइन निर्देशिका को नहीं मिटाता।

## लागू होने की पुष्टि

### ऊपर की स्थिति

बटन पर «निर्देश: चालू» या «निर्देश: बंद» दिखना सर्वर के रनटाइम स्विच की स्थिति बताता है।

### मॉडल को भेजा गया असली अनुरोध देखें

1. «निर्देश: चालू» पर जाएँ।
2. नया सेशन बनाकर सामान्य संदेश भेजें।
3. ऊपर «ट्रैजेक्टरी» खोलें।
4. अभी भेजे गए Assistant अनुरोध को चुनें।
5. दाईं ओर «System Prompt / 系统提示词» विवरण खोलें।
6. प्लेसहोल्डर निर्देश की यह विशेषता खोजें:

```text
# Personal Directive
```

स्विच चालू होने पर यह सामग्री दिखेगी। «निर्देश: बंद» पर जाकर नया संदेश भेजें और नया अनुरोध देखें: ये विशेषताएँ अब नहीं दिखनी चाहिए।

ध्यान दें: बंद करने पर Harness के अन्य सिस्टम प्रॉम्प्ट बने रहते हैं; यह प्रोजेक्ट केवल अपना प्रॉम्प्ट अनुच्छेद हटाता है।

## स्थानीय विकास और जाँचें

```powershell
cd <this repository>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

व्याकरण जाँच के अलावा `harness:check` **होस्ट कॉन्ट्रैक्ट जाँच** (`scripts/check-client-contract.mjs`) चलाता है। यह `lib/client.js` द्वारा होस्ट के `@deepseek-ai/dsh-client-ui-primitives` से लिए गए हर सिंबल को होस्ट की टाइप सतह (`lib/types/**/*.d.ts`) **और** उसके रनटाइम एक्सपोर्ट (`lib/index.js`) के विरुद्ध जाँचता है; यह भी देखता है कि `Button` को दिए जाने वाले `variant` मान अब भी होस्ट के `ButtonVariant` यूनियन में हैं। **होस्ट द्वारा हटाया गया सिंबल नाम के साथ गैर-शून्य निकास देता है**, इसलिए इस तरह का चुपचाप होने वाला ब्रेक (माउंट न होना) अब `node --check` से नहीं निकल सकता — वह केवल यह सिद्ध करता है कि फ़ाइल पार्स होती है, जबकि `React.createElement(undefined)` तब तक नहीं फेंकता जब तक React उसे रेंडर न करे।

यह जाँच होस्ट चेकआउट अपने आप खोज लेती है (इस रिपॉज़िटरी के समानांतर `deepseek-harness`, कोई पूर्वज निर्देशिका, या कोई ज्ञात ड्राइव रूट), या आप इसे स्पष्ट रूप से दे सकते हैं:

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

अगर यह बताए कि कोई होस्ट चेकआउट नहीं मिला, तो `DSH_HOST_ROOT` में अपने DeepSeek Harness चेकआउट का पथ दें।

`harness:check` **Typert कोडेक जाँच** (`scripts/check-typert-codec.mjs`) भी चलाता है। Typert इनवोकेशन कोडेक `{ mode: 'strict', typeSymbol, create }` होता है; 0.1.5 लाइन में यह `{ mode, typeSymbol, schema }` था, और 0.1.7 होस्ट माउंट के समय पुराना रूप अस्वीकार कर देता है — `validateCodec` `typert: <id> result strict codec has no create() factory` फेंकता है, प्लगइन पंक्ति सक्रिय नहीं होती, और इस रिपॉज़िटरी में और कुछ भी यह नहीं देख सकता: पुराना लिटरल पूरी तरह वैध ऑब्जेक्ट है, इसलिए `node --check` पास हो जाता है और परीक्षण Context उसे स्वीकार कर लेता है। यह जाँच उसी होस्ट नियम का स्थानीय दर्पण है। यह दोनों फलकों की असली कलाकृतियाँ बनाती है — `index.js` द्वारा निर्यात `TYPERT` मैनिफ़ेस्ट और `lib/client.js` द्वारा `ctx.remote.$mount` को दिया गया योगदान — हर डिस्क्रिप्टर पर चलती है और माँगती है कि हर कोडेक में **फ़ंक्शन** `create()` हो और कोई `schema` सदस्य न हो, और उल्लंघन करने वाले इनवोकेशन id का नाम देती है। `test/typert-mount.test.mjs` इससे आगे जाता है: दोनों फलकों को असली Cordis `Context` पर असली `@deepseek-ai/dsh-typert-registry` के साथ रजिस्टर करता है, फिर 0.1.5 लाइन के अस्वीकृत कोडेक को स्मृति में दोबारा बनाकर जाँचता है कि रजिस्ट्री उसे अस्वीकार करती है — इससे सिद्ध होता है कि गेट विफल हो सकता है।

```powershell
node scripts/check-typert-codec.mjs
```

`scripts/probe-typert-codec-contract.mjs` प्रश्न के दूसरे आधे भाग का उत्तर *इंस्टॉल किए गए* होस्ट के विरुद्ध देता है, न कि इस रिपॉज़िटरी की उसकी व्याख्या के विरुद्ध: यह असली रजिस्ट्री के साथ दोनों फलकों पर एक `{ mode, typeSymbol, schema }` कोडेक और एक `create()` कोडेक रजिस्टर करता है, और जाँचता है कि पहला अस्वीकृत होता है और दूसरा स्वीकृत। होस्ट लाइन बदलने के बाद इसे चलाकर उस धारणा को दोबारा मापें जिसे गेट कोडित करता है।

```powershell
pnpm run probe:typert-codec
```

Web प्रोफ़ाइल की बंडल संरचना जाँचें:

```powershell
dsh --profile web --dump-config
```

आउटपुट में यह होना चाहिए:

```text
id: personal-directive
name: dsh-personal-directive
```

## सुरक्षा और उपयोग का दायरा

इस फ्रेमवर्क संस्करण में **मूल प्रॉम्प्ट की सामग्री शामिल नहीं है**: पैकेज के साथ तटस्थ प्लेसहोल्डर निर्देश (`prompts/personal-directive.md`) जाता है; रनटाइम व्यवहार किसी भी «सिस्टम प्रॉम्प्ट अनुच्छेद इंजेक्शन» प्लगइन जैसा ही है और केवल आपके दिए निर्देश पाठ को प्रभावित करता है।

यह प्रोजेक्ट मॉडल के भार नहीं बदलता, और दूरस्थ मॉडल सेवा की स्वतंत्र सुरक्षा नीतियों, ऑपरेटिंग सिस्टम अनुमतियों या Harness की वास्तविक टूल अनुमतियों को बायपास नहीं करता।

## श्रेय और लाइसेंस

यह प्रोजेक्ट स्पष्ट रूप से निम्नलिखित मूल प्रोजेक्ट पर आधारित है:

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

मूल लेखक और मूल प्रोजेक्ट का श्रेय बनाए रखा जाना चाहिए।

इस रिपॉज़िटरी की जड़ में मौजूद `LICENSE` इस प्रोजेक्ट के नए कोड और इंटीग्रेशन कोड के लिए इस रिपॉज़िटरी के अनुरक्षक का MIT घोषणापत्र है। यह मूल प्रोजेक्ट के कॉपीराइट को स्वतः प्रतिस्थापित नहीं करता, और इसका अर्थ यह नहीं कि मूल लेखक के मूल प्रॉम्प्ट और मूल कोड को दोबारा लाइसेंस दिया गया है।

इस प्रोजेक्ट को तैयार करते समय मूल रिपॉज़िटरी में कोई स्पष्ट `LICENSE` फ़ाइल या GitHub लाइसेंस पहचान नहीं मिली। इसलिए यह फ्रेमवर्क संस्करण मूल README में बताए गए तीसरे लाइसेंस मार्ग को अपनाता है: **मूल प्रॉम्प्ट के बिना केवल कोड फ्रेमवर्क प्रकाशित करना** — `prompts/personal-directive.md` को तटस्थ प्लेसहोल्डर निर्देश से बदल दिया गया है, और उपयोगकर्ता अपनी निर्देश सामग्री स्वयं दे सकते हैं (मूल पथ ऊपर दिए GitHub लिंक में है; मूल की लाइसेंस स्थिति स्वयं जाँचें)।

इस रिपॉज़िटरी का MIT घोषणापत्र मूल सामग्री पर मूल लेखक के प्राधिकरण के रूप में नहीं पढ़ा जाना चाहिए। यदि मूल लेखक आगे कोई लाइसेंस जोड़ते हैं, तो यह अनुभाग और रिपॉज़िटरी की लाइसेंस फ़ाइल साथ में अद्यतन करें।

## आभार

मूल प्रोजेक्ट के लेखक Minglink को `dsh-infinite-gen-1` का मूल कार्यान्वयन और प्रॉम्प्ट दृष्टिकोण देने के लिए धन्यवाद। यह रिपॉज़िटरी उसी आधार पर केवल व्यक्तिगत निर्देशिका प्रबंधन, Harness Web के ऊपर रनटाइम स्विच और संबंधित इंटीग्रेशन कोड जोड़ती है।

## PerryLink DSH Plugin Family

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के **87 सक्रिय रूप से अनुरक्षित** DeepSeek Harness प्लगइन में से एक है। पूरा परिवार **95** प्लगइन है — **5 फ़्रोज़न**, **3 सेवानिवृत्त** — और नीचे संक्षिप्त रखा गया है ताकि हर README की पहली स्क्रीन छोटी रहे। हर पंक्ति देखने के लिए इसे खोलें; कारण स्थिति कॉलम में है।

<details>
<summary>सभी 95 प्लगइन खोलें</summary>

| प्लगइन | एक पंक्ति | स्थिति |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>
