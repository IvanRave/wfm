Well file manager (WFM)
===

* [Environment] (#environment)
* [Structure] (#structure)

## Environment

![WFMServicesStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cYk9POHE3UTM2Vjg "WFM services structure")

### WFM services
* __WFM client__ https://ivanrave.github.io/wfm-client/
protected cabinet: manage companies, wells etc.
* __WFM info__ https://wfm.azurewebsites.net/
public site with info about WFM: pricing, docs, contacts etc.
* __WFM admin__ http://wfm-admin.azurewebsites.net/ protected service for database administration
(will be moved to Intranet access to protect requests)
* __WFM mobile client__ https://build.phonegap.com/apps/628274/ 
mobile application created from WFM client using Phonegap
* __WFM API__ https://wfm-client.azurewebsites.net/api/
methods to manage WFM data. Methods are secured and required authorization. 
After getting auth token (after registration ang authentication) you can make requests to API
* __WFM Report__ https://wfm-report.herokuapp.com
Generate a report for WFM clients
* __Petrohelp auth__ https://petrohelp-auth.herokuapp.com
An OAUTH2 provider for Petrohelp services, like this WFM
* __WFM API docs__ https://ivanrave.github.io/wfm-api-docs/
Documentaion for API methods

### WFM data storage
* Authentication data: a database to store user profiles
* WFM structured data: relational database to store structured WFM data, e.g. companies, well regions, groups, fields, wells
* WFM unstructured data: non-relational storage to store dynamic data, e.g. well perfomance, well monitoring data
* File storage: secured blob storage to store WFM files

### WFM helpers
* __WFM fonts__ https://github.com/IvanRave/wfm-fonts/
contains section icons for all WFM services
* __WFM dictionary__ https://github.com/IvanRave/wfm-dict/
contains words (with translation) for all WFM services

## Structure
### Hierarchy
![CabinetHierarchy] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cZEh5aWtNWHpQUVE "Cabinet hierarchy")
* Each company may include many users
* User may be in many companies
* Company may contain many regions
* Well regions divides by fields
* Well field divides by groups
* Well group divides by wells
* Each stage (company, region, field, group, well) contains sections and widgets (widgets per section and more).

### Stages

* Workspace - UserProfile (upro)
* Employee - Company (company)
* Well region (wegion)
* Well field (wield)
* Well group (wroup)
* Well (well)

#### A stage may contain
* Properties, like name, description, logo
* Widget layouts with widgets
* Sections (view sections and file sections)
* Child stages (for a bottom stage (the Well) - child stages are empty)

### Sections

Section - it is a part of page view (or part of file manager like a folder).

* Id
* ListOfFiles {Array.<File>} - Files from file table
* IdOfSectionPattern

Name, color, icon, visibility, and other properties of section defined in patterns on admin level.
If needed, properties can be moved from pattern to the section level: for example every section can have own name.

### Section patterns

* IdOfPattern
* Name {string}
* IconUrl {string} - Icon url
* IsVisibleOnPage {boolean} - Is visible on a page. Some sections can be showed only like folders in file manager: do not show on a page.
* IsVisibleAsFolder {boolean} - Is visible in a file manager (as a folder). Some sections (like summary) can't include files: do not show as a folders
* FileFormatRegularExpression {string} - Regular expression for available file formats

### Section files

* A section may contain a list of files
* There are two variants of representation of a list of files
    - Full view, *fmgr-full*
    - Modal view, *fmgr-modal*
* A selected stage contains partials:
    - *fmgr-arousal* (button to show a stage view - on the top panel)
    - *fmgr-modal* (a modal window, hided by default)
* A tab of a selected stage (the main workspace) contains partials:
    - *fmgr-full* (list of folders and files)
    - widget layouts
    - selected section
* *fmgr-full* and *fmgr-modal* partials contains *fmgr-file-list* partial, which contains:
    - list of files
    - buttons to upload and remove files
    - and other features, like sorting, filtering...

#### A full file view (like an explorer in Windows)

Allows to see all files and folders for a current stage. 
There is a simple navigation between folders (sections).
Allows to download files (or quickview, if possible).

#### A modal file view (like an 'Open file' modal in Windows)

Allows to select a file for user's needs.
Only one folder corresponding a selected section.
No quickview (no download), because only one modal window can be runned.

### Well sections

* Summary (main well parameters)
* Sketch and volumes
* History
* Map
* Log
* Perfomance
* Test
* Integrity
* Nodal analysis
* Report

### Report structure
![ReportStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-ccHJFemJOU1lfU2c "Report structure")

### Widget hierarchy
#### Simple scheme
![WidgetStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cbWl3ak94c1pxYWM "Widget structure")
### Data scheme
![WidgetStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cY0V3T3pEVWZjanc "Widget structure")
* Well (well group, well field, well region) may contain widget layouts
* Widget layout may contain widget blocks (columns) - 1, 2, 3 or 4 different size columns
* Widget block may contain widgets
* Widget has options (depending of widget type)

### Oil field map - Map with wells, areas and other objects
* Oil field can contain few maps
* One map can contain few wells (areas etc.)
* Map - is an image (png, jpeg, svg, etc.) with width and height (in pixels)
* Map has a scale coefficient (scaleCoefficient) - pixels per unit of measurement (meter or foot: by default - meter)
* Start point - top-left corner [0,0]
* End point - bottom-right [img.width, img.height]
* Any object on a map has coords: [0 - img.width, 0 - img.height]

#### Map view (for oil field map)
One map can have few map views (in well-map section, in field-map section, in any of widgets...)

##### Properties
* Zoom
* Selected tool
* Translate (for panning)
* Selected well marker
* Selected area

### Perfomance
* Every well group has few parameters, like 'OilRate', 'WaterCumulative'
* These parameters divided by groups, like 'Rate', 'Cumulative'
* Every well contains a graph and a table with these parameters
* Data (graph and table) builded, using values per day (month, year)

#### Steps to load data
1. Select a file with production data
2. Select need columns to import
3. Import data from this file to a database

### Monitoring
* There is a scope of monitoring parameters in a well group (platform)
* Every day a company moderator can point the values for these parameters (a scope of values per well)
* Every parameter includes a procent of change (need to compare with average 30 days data)
* A company moderator can point these procents
* One platform - few parameters
* One well - one procent value per platform parameter
* One parameter - few values (a value per day)
* Every well contains the table and the graph with these values (for some period of time)
* A monitoring table includes a scope of data per well (for current date or some date, selected by user)
* A warning (red) value - is a value, that is out of procent borders, for example:
an average value per month = 40bbl; 
a border procent = 5% (2bbl); 
a current value = 30bbl (40bbl - 30bbl > 2bbl) -> a current value is a warning value

### Well test - Измерение показателей скважины
* Сперва пользователь определяет необходимые параметры для замера.
Все возможные параметры можно получить с помощью GET запроса соотвествующего API
Данные параметры может редактировать только админ (модератор) сайта.
Если пользователь хочет добавить свой какой-либо параметр, ему необходимо связаться с админом (модератором) сайта
(пока не утвердились со всей структурой, лучше это делать просто по имэйлу)
* Выбранные параметры необходимо закрепить за скважиной (Well), точнее за группой (WellGroup):
для каждой WellGroup свой набор параметров, по которым проводятся тесты всех скважин данной группы.
Для связи WellGroup и WfmParameter можно возпользоваться API "WellGroupWfmParameter" (GET - получить, POST - добавить)
* Начало теста. Фактически замер начинается в любое время, принимаемое за начало отсчёта (нулевой час).
Со скважины снимаются показатели (соответствующие выбранным параметрам). Каждый новый час - получение новых показателей.
Тест длится обычно двенадцать часов или сутки. Для разделения понятий введены два обозначения:
<ul>
    <li>TestScope - полный тест, набор ежечасных показателей</li>
    <li>TestData - единица теста - данные за определённый час</li>
</ul>
* Cперва добавляется TestScope, получается созданный TestScope.Id и с этим идентификатором добавляются по очереди TestData
(по возрастанию номера часа: 0, 1, 2.. - лимит технически не задан, но подразумевается либо до 12, либо до 24).
В TestData в параметре Dict содержится набор значений: {WfmParameter.Id: соответствующее значение замера}.
* После подтверждения теста, запись добавляется к production data (при отмене подтверждения - данные удаляются из production data).

### Constants
#### File purposes (array)
    [{ id: 'summary', name: 'Summary', formatList: ['*'] }, // any file type (main well files)
    { id: 'sketch', name: 'Sketch', formatList: ['image/jpeg', 'image/png'] },
    { id: 'volume', name: 'Volume', formatList: ['image/jpeg', 'image/png'] },
    { id: 'history', name: 'History', formatList: ['*'] }, // any file type
    { id: 'map', name: 'Map', formatList: [] }, // file loading forbidden
    { id: 'log', name: 'Log', formatList: [''] }, // las files has empty mime type
    { id: 'pd', name: 'Perfomance', formatList: ['text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] },
    { id: 'test', name: 'Test', formatList: [] }, // file loading forbidden
    { id: 'integrity', name: 'Integrity', formatList: ['image/jpeg', 'image/png', 'application/pdf'] },
    { id: 'nodalanalysis', name: 'Nodal analysis', formatList: ['image/jpeg', 'image/png'] },
    { id: 'report', name: 'Report', formatList: ['application/pdf'] }]

#### Access levels for company user (JSON object)
    {
    "CanManageAll":{"AccessCode":1,"Description":"Can manage"},
    "CanEditAll":{"AccessCode":2,"Description":"Can edit"},
    "CanViewAll":{"AccessCode":4,"Description":"Can view"}
    }
every user has a property "AccessLevel" (which equals SUM of AccessCode from the Enumerator above).
For example: if user "Can view" and "Can edit" then AccessLevel = (4 + 2 = 6).
To check "Whether the user has access to edit (or manage, or view..)?", you may use "bitwise AND":
```return (user.AccessLevel & needAccessLevel) > 0```