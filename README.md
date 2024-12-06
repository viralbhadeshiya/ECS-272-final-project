# Software Functionalities

Our project explores the impact of COVID-19 across the world. We are using a martini glass structure to first explore Europe of how COVID has affected the European countries and then allowing the users to interact with our visualizations that shows the entire global map to explore. 

## Europe Narrative
1) For the narrative, the one type of interaction that's available is the drop down menu for choosing the waves: Wave 1, Wave 2, and Wave 3. All three visualizations: Line Chart for Deaths, Line Chart for Cases, and Economic Bar Chart are all synced so according to user's choice of which wave to view in detail, they all show the same wave. (i.e. If wave 1 is selected, it will show Wave 1 Line Chart for Death and Cases and wave 1 for the economic bar chart).
2) The other interaction is the timeline bar for map showing the rate of cases filling up. User could pause or play so they could view the visualization at their own speed. It starts out by showing the entire global map, but starts to zoom into show the European countries. We did not enable the zoom interaction for the users as we wanted the users to concentrate on the rate of filling for Europe.

## Interactivity
Largely, there are 4 visualizations for the users to interact with at the end of the narrative. We wanted the users to explore on their own and find their own insights. 
1) **Global Map Animation**: Users could use their mouse to zoom in or zoom out. There is a bound set so the user could never leave the view where they no longer see any countries. They could hover over the countries to view the name of the countries and it would also highlight the country's border. Same as in Europe's narrative, there is a timeline bar that user has control of and enabled a "click" feature to click on the countries to trigger our next visualization: Line Graph. (There is a change in mouse cursor to indicate that it's 'clickable')
2) **Line Chart**: Once a country is clicked from the geographical map animation, it would automatically trigger the Line Chart to appear. It would gather data of the selectedCountry and currentWave (according to the timeline bar) and show a line chart of selectedCountry's selectedWave - Total Cases. (i.e. if Russia is clicked and timeline bar is currently on Wave 1, it would trigger Russia's wave 1 TotalCases Line Chart). User has an option to view Total Cases OR Total Deaths. In additon, user could also select which policy to view: Stay-at-Home Policy or Vaccination Policy by the government. There is an icon for such policy that user could drag along the line and at that certain Date if there is a governmental policy enabled, it would trigger the explanation of what was going on and the detail of the policy.
3) **Bar Chart Racing**: We did not enable any user interactivity in this visualization as this animation is to help users to understand the geographical map animation better. It shows the top 5 countries with highest rate of speed (We calculated the proportion of filling as cumulativeCases/totalCases).
4) **Grouped Bar Chart for Economy Status**: There is a drop down menu for the user to select which metrics to view: manufacturing PMI, services PMI, consumer confidence. User could also click on the bar to "focus" (i.e. if user clicks on a bar for Switzerland wave 2, it would trigger a new bar chart that specifically shows all the months for Switzerland wave 2). To go back to the overview grouped bar chart, user could simply click "Refresh" button on the bottom. 
