module.exports = {
    apps: [
        {
            name: 'buenaonda-talks-backend',
            script: './build/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
    ],
};
