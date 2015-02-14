iVisDesigner IPython Integration
====

Steps to use iVisDesigner in IPython:

1. Put `static/ivisdesigner` into `[notebook-profile]/static`.
2. Put `modules/ivisdesigner` into your `PYTHONPATH`.

In IPython notebook, use iVisDesigner as the following:

    from ivisdesigner import Widget as iVisDesignerWidget

    iv = iVisDesignerWidget()

    data = { "points": [ { "x": 1, "y": 2 }, ... ] }

    iv.setData(data)

    # Start to get the visualization definition.
    iv.getVisualization()
    # In the next input cell,
    # Retrieve the visualization data.
    # Data is fetched asynchronously.
    # Don't run this in the same cell as iv.getVisualization().
    vis = iv.visualization

    # Set visualization.
    iv.visualization = vis
