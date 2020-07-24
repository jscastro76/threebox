function objectTest(instance){

    var mesh = new THREE.Mesh();
    var group

    test('OBJECT _makeGroup from one object', function(t){
        group = instance.objects._makeGroup(mesh, {foo: true});

        t.equal(group.userData.foo, true);
        t.equal(group.type, 'Group');
        t.equal(group.children.length, 1);
        t.end();

    });

    test('OBJECT _makeGroup from multiple objects', function(t){
        var mesh2 = new THREE.Mesh();
        group = instance.objects._makeGroup([mesh, mesh2], {foo: false});

        t.equal(group.userData.foo, false);
        t.equal(group.type, 'Group');
        t.equal(group.children.length, 2);
        t.end();

    })

    test('OBJECT _addMethods static', function(t){

        group = instance.objects._makeGroup(mesh, {});
        var addedMethods = instance.objects._addMethods(group, true);

        t.equal(addedMethods.setCoords, undefined);
        t.equal(addedMethods.type, 'Group');
        t.end();

    })

    test('OBJECT _addMethods dynamic', function(t){

        var sphere = instance.sphere({units: 'meters'});

        t.equal(sphere.type, 'Group');
        t.equal(typeof sphere.followPath, 'function');
        t.deepEqual(sphere.coordinates, [0,0,0]);
        t.end();

    })

    test('OBJECT setCoords updates both position and scale', function(t){

        var sphere = instance.sphere({units: 'meters'});
        var newPosition = [0,-20];

        sphere.setCoords(newPosition)
        var scaleFactor = instance.projectedUnitsPerMeter(newPosition[1]);

        vector3Equals(t, sphere.position, instance.projectToWorld(newPosition));
        t.equal(sphere.scale.x, scaleFactor);
        t.deepEqual(sphere.coordinates, newPosition)
        t.end();

    })

}
