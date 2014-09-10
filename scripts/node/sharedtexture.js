// iVisDesigner - File: scripts/node/sharedtexture.js
// Copyright (c) 2013-2014, Donghao Ren
// University of California Santa Barbara, Peking University
// Advised by Prof. Tobias Hollerer and previously by Prof. Xiaoru Yuan.
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var SharedTexture = function(info, is_create) {
    var SharedMemory = require("node_sharedmemory").SharedMemory;
    if(is_create) {
        info.shm_size = info.width * info.height * 4 + 1024;
        var shm = new SharedMemory(0, 0, info.shm_size, true);
        info.shm_id = shm.shmid();
        info.sem_id = shm.semid();
        this.shm = shm;
    } else {
        this.shm = new SharedMemory(info.shm_id, info.sem_id, info.shm_size, false);
    }
    this.metadata = this.shm.buffer(0, 32);
    this.buffer = this.shm.buffer(32);
    var self = this;
    this.getTimestamp = function() { return self.metadata.readDoubleLE(0); };
    this.setTimestamp = function(value) { self.metadata.writeDoubleLE(value, 0); };
};
