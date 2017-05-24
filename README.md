# Connections

The Connections screen is the core of mParticle's functionality. It controls how event data from your inputs (iOS, Android, Web, Feeds, etc) is forwarded to your Output services. You must set up a separate connection for each input/output. For each connection, you have a number of opportunities to cleanse and filter your data, to ensure that each output receives the data you want it to receive, in the correct format.

## Connections flow

![Connections Overview](/img/connections-overview.png)

Each of mParticle's Output services has it's own requirements, so the process for setting up each connection will be a little different, but all connections require these basic steps:

### 1. Select an input

Select the input you want to configure. When you first load the connections screen, you will see a list of available inputs. If the list is empty, go to **Setup > Inputs** to create inputs.


### 2. Apply 'All Outputs' transformations

Once you have an input selected, you can setup transformations that will be applied to all Output services connected to that Input. Click **All Outputs** to see options. There are two transformations that can be applied here:

   * [All Outputs Rules](/rules-user-guide.md)
   * User Splits

### 3. Select an Output

Once you have selected an Input, you will see a list of available Output services that can receive data from your selected Input. If this list is empty, go to **Setup > Outputs** to create outputs.

Once you have selected both an input and output, click **Settings** in the right sidebar to provide information specific to this connection. If you want to apply further transformations, you should make sure that the **Status** slider is off, so that you are not sending data to the Output service before you're ready.


### 4. Apply 'Specific Output' transformations

The second set of transformations apply only to your selected Output. Click **Specific Output** to see options. Transformations that can be applied at this step include:
   * Event Filter (Not part of Connections Screen)
   * [Specific Outputs Rules](/rules-user-guide.md)
   * Forwarding Rules
   * Custom Mappings (if supported)
   * User Sampling

### 5. Complete Connection Settings and set Status to 'Sending'

Finally, click **Settings** in the right sidebar to edit any settings that apply to the connection. These will be different for every Output but can include:

  * Credentials
  * What user identifiers and attributes should be sent
  * Encoding to be used for identifying data
  * How custom attributes should be mapped
  * How to handle attributes specific to the Output

When you have completed the required settings, check that the **Status** slider is set to **Sending** and click **Save**.
