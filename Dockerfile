# android-studio.dockerfile
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    wget \
    unzip \
    && apt-get clean

# Download Android Studio
RUN wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.1.1.20/android-studio-2023.1.1.20-linux.tar.gz \
    && tar -xzf android-studio-2023.1.1.20-linux.tar.gz -C /opt/ \
    && rm android-studio-2023.1.1.20-linux.tar.gz

ENV PATH="/opt/android-studio/bin:$PATH"

CMD ["studio.sh"]
