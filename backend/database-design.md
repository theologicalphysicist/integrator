# DATABASE DESIGN

All databases will be stored in mongo db, of which there will be 3 databases:

**dev**: used for local development.
**test**: for .test. & .spec.
**prod**: for "production".

## COLLECTIONS PER DATABASE
- tbl_music_integrations
  - used to store information on syncs & transfers between music apps
<table>
    <thead>
        <tr>
            <th>m_integration_id (primary_key)</th>
            <th>session_id (foreign_key)</th>
            <th>source</th>
            <th>destination</th>
            <th>last_sync</th>
            <th>data</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>string (uuid)</th>
            <th>string (uuid)</th>
            <th>string</th>
            <th>string</th>
            <th>date/number</th>
            <th>array</th>
        </tr>
    </tbody>
</table>
- tbl_productivity_integrations
  - used to store information about transfers between productivity apps
  <table>
    <thead>
        <tr>
            <th>p_integration_id (primary_key)</th>
            <th>session_id (foreign_key)</th>
            <th>source</th>
            <th>destination</th>
            <th>last_sync</th>
            <th>data</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>string (uuid)</th>
            <th>string (uuid)</th>
            <th>string</th>
            <th>string</th>
            <th>date/number</th>
            <th>array</th>
        </tr>
    </tbody>
</table>
- tbl_user_sessions
  - used to store user session details
<table>
    <thead>
        <tr>
            <th>_id_ (primary_key)</th>
            <th>expires</th>
            <th>session</th>
            <th></th>
            <th>last_sync</th>
            <th>data</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>string (uuid)</th>
            <th>string (uuid)</th>
            <th>string</th>
            <th>string</th>
            <th>date/number</th>
            <th>array</th>
        </tr>
    </tbody>
</table>