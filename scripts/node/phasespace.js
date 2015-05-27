// Arguments.
var fov_x = 90;
var fov_y = 50;
var test_only = false;
var latency = 0; // seconds
var lowpass_fc = 1;

// Parse arguments.
if(process.argv[2]) fov_x = parseFloat(process.argv[2]);
if(process.argv[3]) fov_y = parseFloat(process.argv[3]);
if(process.argv[4]) test_only = true;


var TrackingSimulator = function(latency, lowpass_fc) {
    this.latency = latency;
    this.lowpass_fc = lowpass_fc;
    this.cache = [];
    this.previous_result = null;
    this.previous_time = 0;
};

TrackingSimulator.prototype.feed = function(t, pose) {
    this.cache.push([ t, pose ]);
    while(this.cache.length > 0 && this.cache[0][0] < t - this.latency) {
        this.cache.splice(0, 1);
    }
    if(this.previous_result) {
        var dt = this.cache[0][0] - this.previous_time;
        this.previous_time = this.cache[0][0];
        var two_dt_fc_pi = 2 * Math.PI * dt * this.lowpass_fc;
        var alpha = two_dt_fc_pi / (1 + two_dt_fc_pi);
        var r = this.previous_result.slerp(this.cache[0][1], alpha);
        this.previous_result = r;
        return r;
    } else {
        this.previous_result = this.cache[0][1];
        this.previous_time = this.cache[0][0];
        return this.cache[0][1];
    }
};

var tracking_simulator = new TrackingSimulator(latency, lowpass_fc);

// Communication stuff.
var zmq = require("zmq");
var pub = zmq.socket("pub");
pub.bind("tcp://192.168.10.80:60155");
// pub.bind("epgm://192.168.10.80;224.0.0.1:60155");

var publish = function(msg) {
    pub.send(JSON.stringify(msg));
};

// Enter calibration mode.
publish({
    type: "calibrate_mode",
    value: 1
});

publish({
    type: "view_angles",
    x: fov_x, y: fov_y
});

publish({
    type: "view_directions",
    vp_x: {
        x: 1, y: 0, z: 0
    },
    vp_y: {
        x: 0, y: 1, z: 0
    },
    pose: {
        x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1
    }
});

console.log("Fov x:", fov_x, "y:", fov_y);
console.log("Calibration begin.");

var Quaternion = require("allofwutils").math.Quaternion;
var Vector3 = require("allofwutils").math.Vector3;

function matrix_to_quaternion(mat) {
    var r11 = mat[0][0], r21 = mat[1][0], r31 = mat[2][0];
    var r12 = mat[0][1], r22 = mat[1][1], r32 = mat[2][1];
    var r13 = mat[0][2], r23 = mat[1][2], r33 = mat[2][2];
    var sign = function(a) { return a < 0 ? -1 : 1; };
    var q0 = ( r11 + r22 + r33 + 1.0) / 4.0;
    var q1 = ( r11 - r22 - r33 + 1.0) / 4.0;
    var q2 = (-r11 + r22 - r33 + 1.0) / 4.0;
    var q3 = (-r11 - r22 + r33 + 1.0) / 4.0;
    if(q0 < 0.0) q0 = 0.0;
    if(q1 < 0.0) q1 = 0.0;
    if(q2 < 0.0) q2 = 0.0;
    if(q3 < 0.0) q3 = 0.0;
    q0 = Math.sqrt(q0);
    q1 = Math.sqrt(q1);
    q2 = Math.sqrt(q2);
    q3 = Math.sqrt(q3);
    if(q0 >= q1 && q0 >= q2 && q0 >= q3) {
        q0 *= +1.0;
        q1 *= sign(r32 - r23);
        q2 *= sign(r13 - r31);
        q3 *= sign(r21 - r12);
    } else if(q1 >= q0 && q1 >= q2 && q1 >= q3) {
        q0 *= sign(r32 - r23);
        q1 *= +1.0;
        q2 *= sign(r21 + r12);
        q3 *= sign(r13 + r31);
    } else if(q2 >= q0 && q2 >= q1 && q2 >= q3) {
        q0 *= sign(r13 - r31);
        q1 *= sign(r21 + r12);
        q2 *= +1.0;
        q3 *= sign(r32 + r23);
    } else if(q3 >= q0 && q3 >= q1 && q3 >= q2) {
        q0 *= sign(r21 - r12);
        q1 *= sign(r31 + r13);
        q2 *= sign(r32 + r23);
        q3 *= +1.0;
    }
    return new Quaternion(new Vector3(q1, q2, q3), q0).normalize();
}

// Rigid body pose estimation.
function vector3mean(vectors) {
    var N = vectors.length;
    var r = [ 0, 0, 0 ];
    for(var i = 0; i < N; i++) {
        r[0] += vectors[i][0];
        r[1] += vectors[i][1];
        r[2] += vectors[i][2];
    }
    r[0] /= N; r[1] /= N; r[2] /= N;
    return r;
}

function estimate_rigid_pose(reference, target) {
    var N = reference.length;
    var reference_center = vector3mean(reference);
    var target_center = vector3mean(target);
    var H = [ [0, 0, 0], [0, 0, 0], [0, 0, 0] ];
    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 3; j++) {
            var sum = 0;
            for(var k = 0; k < N; k++) {
                sum += (reference[k][i] - reference_center[i]) * (target[k][j] - target_center[j]);
            }
            H[i][j] = sum;
        }
    }
    var svd = numeric.svd(H);
    var R = numeric.dot(svd.V, numeric.transpose(svd.U));
    var Rm = numeric.dot(R, reference_center);
    var T = [ target_center[0] - Rm[0],
              target_center[1] - Rm[1],
              target_center[2] - Rm[2] ]
    // Compute error:
    var err = 0;
    var errs = [];
    for(var i = 0; i < N; i++) {
        var r = numeric.add(numeric.dot(R, reference[i]), T);
        var diff = [0, 0, 0];
        diff[0] = target[i][0] - r[0];
        diff[1] = target[i][1] - r[1];
        diff[2] = target[i][2] - r[2];
        errs[i] = diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2];
        err += errs[i];
    }
    return { R: R, T: T, E: Math.sqrt(err / N), Es: errs };
}

var phasespace = null;
var t_launch = null;
var initial_reference = null;

// State.
var LED_positions = [];
var LED_positions_prev = [];
var pose_estimated = null;

function gettime() { return new Date().getTime() / 1000; }

function setupUpdate() {
    if(!phasespace) {
        phasespace = require("node_phasespace");
        phasespace.start();
    }
    t_launch = gettime();
    console.log("Started!");
}

function strip_lastseen(v) { return [ v[0], v[1], v[2] ]; }

function update() {
    if(!phasespace) return;
    var s1 = 0.8;
    var markers = phasespace.getMarkers(0, 6);
    for(var i = 0; i < 6; i++) {
        LED_positions[i] = [ markers[i][0], markers[i][1], markers[i][2], markers[i][3] ];
        if(LED_positions[i][3] == 0 && LED_positions_prev[i]) {
            LED_positions[i][0] = LED_positions_prev[i][0] * s1 + LED_positions[i][0] * (1 - s1);
            LED_positions[i][1] = LED_positions_prev[i][1] * s1 + LED_positions[i][1] * (1 - s1);
            LED_positions[i][2] = LED_positions_prev[i][2] * s1 + LED_positions[i][2] * (1 - s1);
        }
        LED_positions_prev[i] = LED_positions[i];
    }
    if(gettime() - t_launch > 5 && !initial_reference) {
        initial_reference = [];
        for(var i = 0; i < 6; i++) {
            initial_reference[i] = strip_lastseen(LED_positions[i]);
        }
        if(!test_only) {
            publish({
                type: "calibrate_mode",
                value: 0
            });
        }
        console.log("Calibration ok.");
    }
    if(initial_reference) {
        var pos_ref = [];
        var pos_tar = [];
        var idx = 0;
        for(var i = 0; i < 6; i++) {
            if(LED_positions[i][3] == 0) {
                pos_tar[idx] = strip_lastseen(LED_positions[i]);
                pos_ref[idx] = initial_reference[i];
                idx += 1;
            }
        }
        if(idx >= 4) {
            // We are able to estimate if we can see at least 3 LEDs.
            pose_estimated = estimate_rigid_pose(pos_ref, pos_tar);
        }
    }
    if(pose_estimated) {

        // Convert matrix to quaternion.
        var Q = matrix_to_quaternion(pose_estimated.R);
        var q_tracked = tracking_simulator.feed(new Date().getTime() / 1000, Q);
        var q_diff = Q.mul(q_tracked.conj()).conj();

        var dx = [ 1, 0, 0 ];
        dx = numeric.add(numeric.dot(pose_estimated.R, dx));
        var dy = [ 0, 1, 0 ];
        dy = numeric.add(numeric.dot(pose_estimated.R, dy));
        publish({
            type: "view_directions",
            vp_x: {
                x: dx[0], y: dx[1], z: dx[2]
            },
            vp_y: {
                x: dy[0], y: dy[1], z: dy[2]
            },
            pose: {
                x: 0, y: 0, z: 0, qx: q_diff.v.x, qy: q_diff.v.y, qz: q_diff.v.z, qw: q_diff.w
            }
        });
    }
}

setupUpdate();
setInterval(update, 10);
